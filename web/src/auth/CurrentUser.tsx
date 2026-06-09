//CurrentUser.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useFrappeAuth,
  useFrappeGetDoc,
  useFrappeUpdateDoc,
  useFrappeFileUpload,
  useFrappeEventListener,
} from "frappe-react-sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define a custom error type that includes both standard Error properties and Frappe SDK Error properties
type CustomError = Error & {
  httpStatus?: number;
  httpStatusText?: string;
  serverMessages?: string[];
  data?: string;
};

// Define the User type if it is not already defined
interface User {
  // Define the properties of the User type here
  id: string;
  name: string;
  email: string;
  user_image?: string;
  enabled: boolean;
}

interface CurrentUserContextType {
  user: User | null;
  isLoading: boolean;
  error: CustomError | null;
  updateUser: (data: Partial<User>) => Promise<void>;
  uploadUserImage: (file: File) => Promise<void>;
  deactivateAccount: () => Promise<void>;
  showDialog: (title: string, description: string) => void;
  mutate: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined
);

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, logout } = useFrappeAuth();
  const {
    data: user,
    error: frappeError,
    isLoading,
    mutate,
  } = useFrappeGetDoc<User>("User", currentUser || "");
  const { updateDoc } = useFrappeUpdateDoc();
  const { upload } = useFrappeFileUpload();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [error, setError] = useState<CustomError | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
    if (frappeError) {
      setError({
        ...frappeError,
        name: frappeError.message || "Unknown error",
        message: frappeError.message || "An unknown error occurred",
      });
    }
  }, [user, frappeError]);

  useFrappeEventListener("user_image_updated", () => {
    mutate();
  });

  const showDialog = (title: string, description: string) => {
    setDialogContent({ title, description });
    setDialogOpen(true);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!currentUser) return;

    try {
      await updateDoc("User", currentUser, data);
      mutate(); // Refresh the user data
      showDialog(
        "Profile Updated",
        "Your profile has been successfully updated."
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showDialog(
        "Update Failed",
        "There was an error updating your profile. Please try again."
      );
    }
  };

  const uploadUserImage = async (file: File) => {
    if (!currentUser) return;

    try {
      const uploadedFile = await upload(file, {
        doctype: "User",
        docname: currentUser,
        fieldname: "user_image",
      });
      await updateDoc("User", currentUser, {
        user_image: uploadedFile.file_url,
      });
      mutate();
      showDialog(
        "Image Uploaded",
        "Your profile image has been successfully updated."
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      showDialog(
        "Upload Failed",
        "There was an error uploading your image. Please try again."
      );
    }
  };

  const deactivateAccount = async () => {
    if (!currentUser) return;

    try {
      await updateDoc("User", currentUser, { enabled: 0 });
      showDialog(
        "Account Deactivated",
        "Your account has been deactivated. You will be logged out."
      );
      await logout();
    } catch (error) {
      console.error("Error deactivating account:", error);
      showDialog(
        "Deactivation Failed",
        "There was an error deactivating your account. Please try again."
      );
    }
  };

  return (
    <CurrentUserContext.Provider
      value={{
        user: localUser,
        isLoading,
        error: error || null,
        updateUser,
        uploadUserImage,
        deactivateAccount,
        showDialog,
        mutate: mutate as () => Promise<void>,
      }}
    >
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </CurrentUserContext.Provider>
  );
};

export const UseCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};

export default CurrentUserProvider;