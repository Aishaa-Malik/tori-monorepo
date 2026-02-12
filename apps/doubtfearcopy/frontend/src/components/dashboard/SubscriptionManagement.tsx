import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubscriptionAnalytics, 
  getSubscriptionPlans, 
  updateSubscriptionStatus,
  SubscriptionPlan 
} from '../../services/subscriptionService';

interface SubscriptionManagementProps {
  className?: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ className = '' }) => {
  const { tenant, user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (tenant?.id) {
      fetchSubscriptionData();
      fetchAvailablePlans();
    }
  }, [tenant?.id]);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!tenant?.id) return;
      
      const data = await getSubscriptionAnalytics(tenant.id);
      setSubscriptionData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const plans = await getSubscriptionPlans();
      setAvailablePlans(plans);
    } catch (err: any) {
      console.error('Failed to fetch available plans:', err);
    }
  };

  const handleUpgradePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = () => {
    if (selectedPlan) {
      // Redirect to pricing page with pre-selected plan
      window.location.href = `/#pricing?plan=${selectedPlan.name}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Subscription</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubscriptionData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subscriptionData?.hasActiveSubscription) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="text-blue-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          <button
            onClick={() => window.location.href = '/#pricing'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const { subscription, usage, daysUntilRenewal } = subscriptionData;
  const plan = subscription.plans;

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Subscription Management</h2>
        <p className="text-sm text-gray-600">Manage your current plan and usage</p>
      </div>

      {/* Current Subscription */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current Plan</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan:</span>
                <span className="text-sm font-medium text-gray-900">
                  {plan?.name || 'Unknown Plan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{plan?.price || 'N/A'}/month
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Billing Cycle:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(subscription.billing_cycle_start)} - {formatDate(subscription.billing_cycle_end)}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Usage This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Appointments Used:</span>
                <span className="text-sm font-medium text-gray-900">
                  {usage.currentUsage}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Limit:</span>
                <span className="text-sm font-medium text-gray-900">
                  {usage.isUnlimited ? 'Unlimited' : usage.limit}
                </span>
              </div>
              {!usage.isUnlimited && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {usage.remainingAppointments}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Can Book:</span>
                <span className={`text-sm font-medium ${usage.canBook ? 'text-green-600' : 'text-red-600'}`}>
                  {usage.canBook ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar for Usage */}
        {!usage.isUnlimited && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Usage Progress</span>
              <span>{usage.currentUsage} / {usage.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  usage.currentUsage / usage.limit > 0.8 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((usage.currentUsage / usage.limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Renewal Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Renewal:</strong> Your subscription will renew on {formatDate(subscription.billing_cycle_end)}
                {daysUntilRenewal > 0 && ` (in ${daysUntilRenewal} days)`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upgrade Plan
          </button>
          <button
            onClick={() => window.location.href = '/#pricing'}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            View All Plans
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upgrade Your Plan</h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose a plan that better fits your needs. You can upgrade at any time.
              </p>
              
              <div className="space-y-3 mb-6">
                {availablePlans
                  .filter(plan => plan.name !== subscription.plans?.name)
                  .map(plan => (
                    <button
                      key={plan.name}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full p-3 text-left rounded-lg border ${
                        selectedPlan?.name === plan.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{plan.name}</div>
                      <div className="text-sm text-gray-600">
                        ₹{plan.price}/month • {plan.features?.length || 0} features
                      </div>
                    </button>
                  ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgradeConfirm}
                  disabled={!selectedPlan}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
