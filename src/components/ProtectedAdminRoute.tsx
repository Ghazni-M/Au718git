import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Skeleton } from './ui/skeleton';

export const ProtectedAdminRoute = () => {
  const { user, isAdmin, loading, role } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Skeleton className="w-[300px] h-8 mx-auto mb-4 bg-white/10" />
          <Skeleton className="w-[200px] h-4 mx-auto bg-white/10" />
        </div>
      </div>
    );
  }

  // Not logged in OR not an admin → redirect to admin login
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Optional: You can add extra role-based protection here if needed
  // Example: if (role !== 'Admin' && role !== 'Assistant admin') { ... }

  return <Outlet />;
};

