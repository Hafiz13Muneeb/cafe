import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import AlreadyLoggedIn from './AdminLogin/AlreadyLoggedIn';
import LoginForm from './AdminLogin/LoginForm';

const AdminLogin = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If user is logged in, show the "already logged in" screen
  if (isAuthenticated && user) {
    return <AlreadyLoggedIn user={user} />;
  }

  // Otherwise show the login form with tour
  return <LoginForm />;
};

export default AdminLogin;