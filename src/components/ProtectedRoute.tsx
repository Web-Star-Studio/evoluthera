
import React from 'react';
import { Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // For now, just render the outlet - auth logic to be implemented
  return <Outlet />;
};

export default ProtectedRoute;
