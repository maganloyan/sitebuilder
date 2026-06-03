// Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeAuth } from 'frappe-react-sdk';
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MainContent } from "./Sidebar";
import { Skeleton } from "../ui/skeleton";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, isLoading, error } = useFrappeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate("/login");
    }
  }, [isLoading, currentUser, navigate]);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />; 
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Handle authentication error
  }

  if (!currentUser) {
    return null; // Render nothing while redirecting
  }

  // If we reach here, we have a currentUser
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main content */}
      <div className="flex-1">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <MainContent />
      </div>
    </div>
  );
};

export default Dashboard;
