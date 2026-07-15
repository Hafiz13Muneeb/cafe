// src/components/settings/SecuritySettings.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Eye, EyeOff } from 'lucide-react';

const SecuritySettings = ({ loading, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(oldPassword, newPassword, confirmPassword, () => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input
          label="Current Password"
          type={showOld ? 'text' : 'password'}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          aria-label="Current password"
        />
        <button
          type="button"
          onClick={() => setShowOld(!showOld)}
          className="absolute right-3 top-9 text-[#3E2723]"
          aria-label={showOld ? 'Hide password' : 'Show password'}
        >
          {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="relative">
        <Input
          label="New Password"
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          aria-label="New password"
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-9 text-[#3E2723]"
          aria-label={showNew ? 'Hide new password' : 'Show new password'}
        >
          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="relative">
        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          aria-label="Confirm new password"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-9 text-[#3E2723]"
          aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Changing...' : 'Change Password'}
      </Button>
    </form>
  );
};

export default SecuritySettings;