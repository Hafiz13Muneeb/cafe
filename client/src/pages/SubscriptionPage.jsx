// src/pages/SubscriptionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import { Check, Crown, AlertCircle, Loader2 } from 'lucide-react';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [pricing, setPricing] = useState({ monthlyPrice: 39, trialPeriodDays: 30, currency: 'USD' });
  const [pricingLoading, setPricingLoading] = useState(true);

  // Fetch pricing from backend
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await api.get('/settings/pricing');
        if (res.data.success) {
          setPricing(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setPricingLoading(false);
      }
    };
    fetchPricing();
  }, []);

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

  const handleUpgrade = async () => {
    const variantId = import.meta.env.VITE_LEMON_SQUEEZY_VARIANT_ID;
    if (!variantId) {
      alert('Payment configuration is incomplete. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments/create-checkout', {
        variantId: variantId,
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
  const isPaid = subscription?.plan === 'paid';
  const isTrial = subscription?.trialEndsAt && new Date(subscription.trialEndsAt) > new Date();

  return (
    <DashboardLayout title="Subscription" subtitle="Manage Your Plan">
      {/* Current Subscription Status */}
      <div className="bg-white border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-bold text-[#3E2723] mb-2">Current Plan</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-2xl font-bold font-['Permanent_Marker'] text-[#8A9A5B] capitalize">
              {isPaid ? 'Paid' : 'Free'}
            </span>
            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-[#EAE0C8] border border-[#3E2723] capitalize">
              {subscription?.status || 'active'}
            </span>
            {isTrial && (
              <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-green-500 text-white border border-[#3E2723]">
                Trial
              </span>
            )}
            {subscription?.currentPeriodEnd && (
              <p className="text-sm text-[#3E2723]/60 mt-1">
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {subscription?.trialEndsAt && (
              <p className="text-sm text-[#3E2723]/60 mt-1">
                Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {isActive && isPaid && (
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

      {/* Single Plan Card */}
      <div className="bg-white border-4 border-[#3E2723] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#8A9A5B] max-w-md mx-auto">
        <div className="text-center">
          <Crown size={48} className="mx-auto text-[#8A9A5B] mb-3" />
          <h2 className="text-2xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
            {pricingLoading ? 'Loading...' : `$${pricing.monthlyPrice}/month`}
          </h2>
          <p className="text-sm text-[#3E2723]/70 mt-1">
            {pricingLoading ? '' : `${pricing.trialPeriodDays}-day free trial`}
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-3 text-sm text-[#3E2723]/80">
            <Check size={18} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
            <span>Unlimited menu items</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#3E2723]/80">
            <Check size={18} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
            <span>Premium QR codes</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#3E2723]/80">
            <Check size={18} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
            <span>Advanced analytics</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#3E2723]/80">
            <Check size={18} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
            <span>Custom theme colors</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#3E2723]/80">
            <Check size={18} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
            <span>Priority support</span>
          </li>
        </ul>

        <div className="mt-6">
          {isPaid && isActive ? (
            <div className="w-full py-2 text-center text-sm font-bold text-white bg-[#8A9A5B] border-2 border-[#3E2723]">
              Active Plan
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handleUpgrade}
              disabled={loading || !import.meta.env.VITE_LEMON_SQUEEZY_VARIANT_ID}
              className="w-full justify-center"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : !import.meta.env.VITE_LEMON_SQUEEZY_VARIANT_ID ? (
                'Unavailable'
              ) : (
                'Start Free Trial'
              )}
            </Button>
          )}
          {!import.meta.env.VITE_LEMON_SQUEEZY_VARIANT_ID && (
            <p className="text-xs text-red-500 mt-2 text-center">
              ⚠️ Payment not configured
            </p>
          )}
        </div>
      </div>

      {/* Payment Info – Updated text */}
      <div className="mt-6 p-4 bg-[#F5F5DC] border-2 border-[#3E2723]">
        <div className="flex items-start gap-2 text-sm text-[#3E2723]/70">
          <AlertCircle size={16} className="text-[#8A9A5B] mt-0.5 flex-shrink-0" />
          <p>
            Payments are securely processed through our integrated payment system. 
            Your billing information is handled with the highest security standards. 
            Subscriptions automatically renew unless you cancel before the renewal date. 
            {pricing.trialPeriodDays > 0 && (
              <> You will not be charged until after your {pricing.trialPeriodDays}-day free trial ends.</>
            )}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;