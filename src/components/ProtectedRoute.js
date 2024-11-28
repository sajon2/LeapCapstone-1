import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { user, token } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (user !== null) {
      setIsAuthChecked(true);
    }
  }, [user, token]);

  if (!isAuthChecked) {
    return null; // Or a loading spinner if you prefer
  }

  if (!user || !token) {
    console.log('Protected route: User not authenticated');
    return <Navigate to="/login" />;
  }

  console.log('Protected route: User authenticated');
  return <Component {...rest} />;
};

export default ProtectedRoute;
