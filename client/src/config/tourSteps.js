// src/config/tourSteps.js
import { User, Lock, CheckCircle, Coffee, Users } from 'lucide-react';

export const getTourSteps = ({
  usernameRef,
  passwordRef,
  loginBtnRef,
  demoBtnRef,
  createAccountRef,
}) => [
  {
    target: usernameRef,
    icon: User,
    title: 'Enter Your Username',
    description: 'Type your cafe username. Use the demo credentials or your own.',
  },
  {
    target: passwordRef,
    icon: Lock,
    title: 'Enter Your Password',
    description: 'Your password is securely stored. Try the demo password: "demo123".',
  },
  {
    target: loginBtnRef,
    icon: CheckCircle,
    title: 'Login to Dashboard',
    description: 'Click here to access your admin panel and start managing your menu.',
  },
  {
    target: demoBtnRef,
    icon: Coffee,
    title: 'Quick Demo',
    description: 'Click here to auto‑fill the demo credentials and test the app instantly.',
  },
  {
    target: createAccountRef,
    icon: Users,
    title: 'New to CafeFlow?',
    description: 'Create your own cafe account and start your digital menu today.',
  },
];