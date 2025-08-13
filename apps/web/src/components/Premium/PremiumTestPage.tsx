import { useState } from "react";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { 
  ProBadge, 
  JoinProBanner, 
  ProfileSelectionModal, 
  ProDashboard,
  PremiumProvider 
} from "./index";

const PremiumTestPage = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { currentAccount } = useAccountStore();

  return (
    <PremiumProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Hey Pro Test Page</h1>
            <p className="text-gray-600">Testing all premium components</p>
            
            {/* Wallet Status */}
            <div className="mt-4 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Wallet Status</h3>
              <p className="text-sm text-gray-600">
                {currentAccount?.address 
                  ? `Connected: ${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
                  : "Not connected"
                }
              </p>
            </div>
          </div>

          {/* Component Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Pro Badge Demo */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pro Badge Component</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Small:</span>
                  <ProBadge size="sm" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Medium:</span>
                  <ProBadge size="md" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Large:</span>
                  <ProBadge size="lg" />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                The badge only shows when user is premium
              </p>
            </div>

            {/* Join Pro Banner Demo */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Pro Banner</h2>
              <JoinProBanner />
              <p className="mt-4 text-xs text-gray-500">
                Shows for Standard users to encourage upgrade
              </p>
            </div>

            {/* Profile Selection Modal Demo */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Selection Modal</h2>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                Open Profile Selection Modal
              </button>
              <p className="mt-4 text-xs text-gray-500">
                Opens modal for OnChainUnlinked users to select profile
              </p>
            </div>

            {/* Pro Dashboard Demo */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pro Dashboard</h2>
              <div className="h-64 overflow-y-auto">
                <ProDashboard />
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Full dashboard for ProLinked users
              </p>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="font-medium text-blue-900">Standard User</h3>
                <p className="text-sm text-blue-700">Not registered in referral program</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <h3 className="font-medium text-yellow-900">OnChainUnlinked</h3>
                <p className="text-sm text-yellow-700">Registered but profile not linked</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="font-medium text-green-900">ProLinked</h3>
                <p className="text-sm text-green-700">Fully set up premium user</p>
              </div>
            </div>
          </div>

          {/* Profile Selection Modal */}
          <ProfileSelectionModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onSuccess={() => {
              setShowProfileModal(false);
              console.log("Profile linked successfully!");
            }}
          />
        </div>
      </div>
    </PremiumProvider>
  );
};

export default PremiumTestPage; 