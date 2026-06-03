// src/components/SetPassword.tsx

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFrappeAuth, useFrappeUpdateDoc, useFrappeGetDoc } from 'frappe-react-sdk'; // Import db from frappe-react-sdk

interface SetPasswordFormInput {
  new_password: string;
  confirm_password: string;
}

const SetPassword: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SetPasswordFormInput>();
  const { currentUser } = useFrappeAuth(); // Use currentUser instead of getLoggedInUser
  const { updateDoc } = useFrappeUpdateDoc();
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit: SubmitHandler<SetPasswordFormInput> = async (data) => {
    if (data.new_password !== data.confirm_password) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Use updateDoc to update the user's password
      await updateDoc('User', currentUser, {
        new_password: data.new_password,
      });

      // Handle success (e.g., show a success message or navigate to another page)
      alert('Password updated successfully!');
      reset();
      onOpenChange(false); // Close the dialog
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage('Failed to update password. Please try again later.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              {...register('new_password', { required: true })}
            />
            {errors.new_password && <span className="text-red-500">This field is required</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              {...register('confirm_password', { required: true })}
            />
            {errors.confirm_password && <span className="text-red-500">This field is required</span>}
          </div>
          {errorMessage && (
            <div className="text-red-500 text-center">{errorMessage}</div>
          )}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetPassword;
