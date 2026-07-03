// src/pages/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import { Check, Crown, Star, Zap, AlertCircle, Loader2 } from 'lucide-react';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  
  // ✅ Use import.meta.env instead of process.env
  const PRO_VARIANT_ID = import.meta.env.VITE_LEMON_SQUEEZY_PRO_VARIANT_ID || 12345;
  const PREMIUM_VARIANT_ID = import.meta.env.VITE_LEMON_SQUEEZY_PREMIUM_VARIANT_ID || 12346;

  const [plans] = useState([
    {
      id: 'free',
      name: 'Free',
      price: 'Rs. 0',
      description: 'Basic features for small cafes',
      features: ['Up to 50 menu items', 'Basic QR code', 'WhatsApp orders', 'Standard theme'],
      variantId: null,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Rs. 999/mo',
      description: 'Perfect for growing cafes',
      features: ['Up to 200 menu items', 'Premium QR codes', 'Advanced analytics', 'Custom theme colors', 'Priority support'],
      variantId: PRO_VARIANT_ID,
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'Rs. 1,999/mo',
      description: 'For high-volume cafes',
      features: ['Unlimited menu items', 'Multiple QR codes', 'Full analytics dashboard', 'White-label branding', 'Dedicated support', 'Early access to new features'],
      variantId: PREMIUM_VARIANT_ID,
    },
  ]);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/payments/subscription');
      if (res.data.success) {
        setSubscription(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (plan) => {
    if (!plan.variantId) return;

    setLoading(true);
    try {
      const res = await api.post('/payments/create-checkout', {
        variantId: plan.variantId,
        returnUrl: `${window.location.origin}/admin/dashboard`,
      });

      if (res.data.success && res.data.data.checkoutUrl) {
        window.location.href = res.data.data.checkoutUrl;
      }
    } catch (err) {
      console.error('Failed to create checkout:', err);
      alert(err.response?.data?.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features after the current billing period.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/cancel');
      if (res.data.success) {
        await fetchSubscription();
        alert('Your subscription will be cancelled at the end of the billing period.');
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert(err.response?.data?.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/resume');
      if (res.data.success) {
        await fetchSubscription();
        alert('Your subscription has been resumed successfully.');
      }
    } catch (err) {
      console.error('Failed to resume subscription:', err);
      alert(err.response?.data?.message || 'Failed to resume subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';
  const planName = subscription?.plan || 'free';
  const currentPlan = plans.find(p => p.id === planName);

  return (
    <DashboardLayout title="Subscription" subtitle="Manage Your Plan">
      {/* Current Subscription Status */}
      <div className="bg-white border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-bold text-[#3E2723] mb-2">Current Plan</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-2xl font-bold font-['Permanent_Marker'] text-[#8A9A5B] capitalize">
              {planName}
            </span>
            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-[#EAE0C8] border border-[#3E2723] capitalize">
              {subscription?.status || 'active'}
            </span>
            {subscription?.currentPeriodEnd && (
              <p className="text-sm text-[#3E2723]/60 mt-1">
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          {isActive && (
            <div className="flex gap-2">
              {!subscription?.cancelAtPeriodEnd ? (
                <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Cancel Subscription'}
                </Button>
              ) : (
                <Button variant="primary" onClick={handleResume} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Resume Subscription'}
                </Button>
              )}
            </div>
          )}
          {isCancelled && (
            <p className="text-sm text-red-500 font-bold">
              ⚠️ This subscription has been cancelled and will expire soon.
            </p>
          )}
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === planName;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`
                bg-white border-4 border-[#3E2723] p-4 sm:p-6 relative
                ${isCurrentPlan ? 'shadow-[8px_8px_0px_0px_#8A9A5B]' : 'shadow-[4px_4px_0px_0px_#EAE0C8]'}
                ${isPopular ? 'border-[#8A9A5B]' : ''}
              `}
            >
              {isPopular && (
                <span className="absolute -top-3 right-4 px-3 py-0.5 bg-[#8A9A5B] text-white text-xs font-bold border-2 border-[#3E2723]">
                  Popular
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
                  {plan.name}
                </h3>
                {isCurrentPlan && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#8A9A5B] text-white border-2 border-[#3E2723]">
                    Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-[#3E2723]">{plan.price}</p>
              <p className="text-sm text-[#3E2723]/70 mt-1">{plan.description}</p>
              <ul className="mt-4 space-y-1.5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[#3E2723]/80">
                    <Check size={16} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {plan.id === 'free' ? (
                  <div className="w-full py-2 text-center text-sm font-bold text-[#3E2723]/50 bg-[#EAE0C8] border-2 border-[#3E2723]">
                    {isCurrentPlan ? 'Current Plan' : 'Free'}
                  </div>
                ) : isCurrentPlan ? (
                  <div className="w-full py-2 text-center text-sm font-bold text-white bg-[#8A9A5B] border-2 border-[#3E2723]">
                    Active
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading}
                    className="w-full justify-center text-sm"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin mr-1" />
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Info */}
      <div className="mt-6 p-4 bg-[#F5F5DC] border-2 border-[#3E2723]">
        <div className="flex items-start gap-2 text-sm text-[#3E2723]/70">
          <AlertCircle size={16} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
          <p>
            Payments are securely processed by{' '}
            <a
              href="https://lemonsqueezy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8A9A5B] hover:underline font-medium"
            >
              Lemon Squeezy
            </a>
            . We don't store your payment details. Subscriptions auto-renew unless cancelled.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;