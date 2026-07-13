// src/pages/AdminLogin/AlreadyLoggedIn.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { CheckCircle, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';

const AlreadyLoggedIn = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <div
        className="w-full max-w-md border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8 text-center"
        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
      >
        <div
          className="inline-block p-4 rounded-full border-2 border-[#3E2723] mb-4"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <CheckCircle size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
          You are already logged in
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Signed in as <strong>{user.username}</strong> ({user.role === 'superadmin' ? 'Super Admin' : 'Owner'}).
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          If you want to sign in with a different account, please log out first.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={() => navigate(user.role === 'superadmin' ? '/admin/super' : '/admin/dashboard')}
            className="w-full justify-center"
          >
            Go to Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="w-full justify-center"
          >
            <LogOut size={16} className="inline mr-2" /> Logout
          </Button>
        </div>
        <div className="mt-4 border-t border-[#3E2723]/20 pt-4">
          <Link to="/register" className="text-xs hover:underline" style={{ color: 'var(--primary-color)' }}>
            Create another account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlreadyLoggedIn;