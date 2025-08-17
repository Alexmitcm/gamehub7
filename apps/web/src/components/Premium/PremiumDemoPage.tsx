import React from 'react';
import PremiumDashboard from './PremiumDashboard';

export default function PremiumDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Registration System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the complete premium registration flow with automatic network switching, 
            profile discovery, and seamless Lens integration.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Network Management</h3>
            <p className="text-gray-600">
              Automatic detection and switching to Arbitrum One network with user-friendly instructions.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lens Profile Discovery</h3>
            <p className="text-gray-600">
              Automatically discover and manage Lens profiles associated with your wallet address.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless Registration</h3>
            <p className="text-gray-600">
              Complete premium registration with automatic profile linking and referral system support.
            </p>
          </div>
        </div>

        {/* Main Dashboard */}
        <PremiumDashboard 
          referrerAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
        />

        {/* Technical Details */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Implementation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Backend Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real ABI encoding with viem</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Lens API integration for profile discovery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Network validation and management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Comprehensive user status tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Smart contract interaction endpoints</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Frontend Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>React Query integration for data management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Wagmi hooks for wallet integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Tailwind CSS for modern UI design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>TypeScript for type safety</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Responsive design for all devices</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">API Endpoints</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">All endpoints are available at <code className="bg-gray-200 px-2 py-1 rounded">/new-premium-registration/*</code></p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-200 px-2 py-1 rounded">GET /user-status</code> - Get user premium status</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">GET /discover-profiles</code> - Discover Lens profiles</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">POST /auto-link-profile</code> - Auto-link best profile</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">GET /validate-network</code> - Validate network status</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">POST /register</code> - Complete premium registration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
