// src/pages/SubscriptionPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import { Check, Crown, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Cache helpers
const CACHE_TTL = {
  PRICING: 5 * 60 * 1000, // 5 minutes
  SUBSCRIPTION: 30 * 1000, // 30 seconds
};

const getCachedData = (key, ttl) => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedData = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    // ignore
  }
};

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [pricing, setPricing] = useState({ monthlyPrice: 39, trialPeriodDays: 30, currency: 'USD' });
  const [pricingLoading, setPricingLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pricing from backend (with caching)
  const fetchPricing = async (force = false) => {
    if (!force) {
      const cached = getCachedData('pricing', CACHE_TTL.PRICING);
      if (cached) {
        setPricing(cached);
        setPricingLoading(false);
        return;
      }
    }
    try {
      setPricingLoading(true);
      const res = await api.get('/settings/pricing');
      if (res.data.success) {
        const data = res.data.data;
        setPricing(data);
        setCachedData('pricing', data);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    } finally {
      setPricingLoading(false);
    }
  };

  // Fetch subscription (with caching)
  const fetchSubscription = async (force = false) => {
    if (!force) {
      const cached = getCachedData('subscription', CACHE_TTL.SUBSCRIPTION);
      if (cached) {
        setSubscription(cached);
        return;
      }
    }
    try {
      const res = await api.get('/payments/subscription');
      if (res.data.success) {
        const data = res.data.data;
        setSubscription(data);
        setCachedData('subscription', data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  // Manual refresh for subscription
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubscription(true);
    toast.success('Subscription status refreshed');
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPricing();
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
        await fetchSubscription(true);
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
        await fetchSubscription(true);
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
      <div
        className="border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] p-4 sm:p-6 mb-6"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Current Plan</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs font-bold flex items-center gap-1 hover:underline transition"
            style={{ color: 'var(--primary-color)' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <div>
            <span
              className="text-2xl font-bold font-['Permanent_Marker'] capitalize"
              style={{ color: 'var(--primary-color)' }}
            >
              {isPaid ? 'Paid' : 'Free'}
            </span>
            <span
              className="ml-2 inline-block px-2 py-0.5 text-xs font-bold border border-[#3E2723] capitalize"
              style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}
            >
              {subscription?.status || 'active'}
            </span>
            {isTrial && (
              <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-green-500 text-white border border-[#3E2723]">
                Trial
              </span>
            )}
            {subscription?.currentPeriodEnd && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {subscription?.trialEndsAt && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
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
      <div
        className="border-4 border-[#3E2723] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#3E2723] max-w-md mx-auto"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="text-center">
          <Crown size={48} className="mx-auto mb-3" style={{ color: 'var(--primary-color)' }} />
          <h2
            className="text-2xl font-bold font-['Permanent_Marker']"
            style={{ color: 'var(--text-color)' }}
          >
            {pricingLoading ? 'Loading...' : `${pricing.currency || '$'}${pricing.monthlyPrice}/month`}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {pricingLoading ? '' : `${pricing.trialPeriodDays}-day free trial`}
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {[
            'Unlimited menu items',
            'Premium QR codes',
            'Advanced analytics',
            'Custom theme colors',
            'Priority support',
          ].map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Check size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {isPaid && isActive ? (
            <div
              className="w-full py-2 text-center text-sm font-bold text-white border-2 border-[#3E2723]"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
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

      {/* Payment Info */}
      <div
        className="mt-6 p-4 border-2 border-[#3E2723]"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
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