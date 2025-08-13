import { useEffect, useState } from "react";
import { HEY_API_URL } from "@hey/data/constants";

interface FeatureInfo {
  id: string;
  featureId: string;
  name: string;
  description: string;
  category: string;
  standardAccess: boolean;
  premiumAccess: boolean;
  adminOverride: boolean;
  isActive: boolean;
  userAccessCount: number;
}

interface AdminUserInfo {
  id: string;
  walletAddress: string;
  email: string;
  username: string;
  displayName?: string;
  role: "SuperAdmin" | "SupportAgent" | "Auditor" | "Moderator";
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

const FeatureManagement = () => {
  const [features, setFeatures] = useState<FeatureInfo[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureInfo | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [targetWallet, setTargetWallet] = useState("");
  const [grantAccess, setGrantAccess] = useState(true);

  // Form states
  const [featureForm, setFeatureForm] = useState({
    featureId: "",
    name: "",
    description: "",
    category: "",
    standardAccess: false,
    premiumAccess: true,
    adminOverride: true,
    isActive: true
  });

  useEffect(() => {
    fetchFeatures();
    fetchAdminUserInfo();
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${HEY_API_URL}/admin/features`);
      if (!response.ok) throw new Error("Failed to fetch features");
      
      const data = await response.json();
      setFeatures(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch features");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUserInfo = async () => {
    try {
      // This would typically come from the current admin's session
      const adminWallet = "0x123..."; // Placeholder
      const response = await fetch(`${HEY_API_URL}/admin/admin-user?walletAddress=${adminWallet}`);
      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin user info:", err);
    }
  };

  const handleCreateFeature = async () => {
    if (!adminUser || !featureForm.featureId || !featureForm.name) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${HEY_API_URL}/admin/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWalletAddress: adminUser.walletAddress,
          ...featureForm
        })
      });

      if (!response.ok) throw new Error("Failed to create feature");

      setShowCreateModal(false);
      setFeatureForm({
        featureId: "",
        name: "",
        description: "",
        category: "",
        standardAccess: false,
        premiumAccess: true,
        adminOverride: true,
        isActive: true
      });
      fetchFeatures(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create feature");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFeature = async () => {
    if (!adminUser || !selectedFeature) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${HEY_API_URL}/admin/features/${selectedFeature.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWalletAddress: adminUser.walletAddress,
          ...featureForm
        })
      });

      if (!response.ok) throw new Error("Failed to update feature");

      setShowEditModal(false);
      setSelectedFeature(null);
      fetchFeatures(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update feature");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeatureAccess = async () => {
    if (!adminUser || !selectedFeature || !targetWallet) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${HEY_API_URL}/admin/features/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWalletAddress: adminUser.walletAddress,
          targetWallet,
          featureId: selectedFeature.featureId,
          grantAccess,
          reason: `Feature access ${grantAccess ? "granted" : "revoked"} by admin`
        })
      });

      if (!response.ok) throw new Error("Failed to update feature access");

      setShowAccessModal(false);
      setTargetWallet("");
      setGrantAccess(true);
      setSelectedFeature(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update feature access");
    } finally {
      setActionLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    if (!adminUser) return false;
    if (adminUser.role === "SuperAdmin") return true;
    return adminUser.permissions.includes(permission);
  };

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.featureId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(feature => 
    !categoryFilter || feature.category === categoryFilter
  );

  const categories = [...new Set(features.map(f => f.category))];

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
      : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Management</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {hasPermission("feature.create") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Feature
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Features Table */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Access Control
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredFeatures.map((feature) => (
                <tr key={feature.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{feature.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{feature.featureId}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{feature.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {feature.category.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Standard:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          feature.standardAccess 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                        }`}>
                          {feature.standardAccess ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Premium:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          feature.premiumAccess 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                        }`}>
                          {feature.premiumAccess ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Admin Override:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          feature.adminOverride 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
                        }`}>
                          {feature.adminOverride ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feature.isActive)}`}>
                      {feature.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {feature.userAccessCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {hasPermission("feature.manage") && (
                        <button
                          onClick={() => {
                            setSelectedFeature(feature);
                            setFeatureForm({
                              featureId: feature.featureId,
                              name: feature.name,
                              description: feature.description,
                              category: feature.category,
                              standardAccess: feature.standardAccess,
                              premiumAccess: feature.premiumAccess,
                              adminOverride: feature.adminOverride,
                              isActive: feature.isActive
                            });
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission("feature.manage") && (
                        <button
                          onClick={() => {
                            setSelectedFeature(feature);
                            setShowAccessModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Manage Access
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Feature Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create New Feature</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feature ID</label>
                  <input
                    type="text"
                    value={featureForm.featureId}
                    onChange={(e) => setFeatureForm({...featureForm, featureId: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., premium_chat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={featureForm.name}
                    onChange={(e) => setFeatureForm({...featureForm, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Premium Chat"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the feature..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  value={featureForm.category}
                  onChange={(e) => setFeatureForm({...featureForm, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., communication"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="standard-access"
                    checked={featureForm.standardAccess}
                    onChange={(e) => setFeatureForm({...featureForm, standardAccess: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="standard-access" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Standard Access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="premium-access"
                    checked={featureForm.premiumAccess}
                    onChange={(e) => setFeatureForm({...featureForm, premiumAccess: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="premium-access" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Premium Access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="admin-override"
                    checked={featureForm.adminOverride}
                    onChange={(e) => setFeatureForm({...featureForm, adminOverride: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="admin-override" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Admin Override
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCreateFeature}
                  disabled={actionLoading || !featureForm.featureId || !featureForm.name}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Feature"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFeatureForm({
                      featureId: "",
                      name: "",
                      description: "",
                      category: "",
                      standardAccess: false,
                      premiumAccess: true,
                      adminOverride: true,
                      isActive: true
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Feature Modal */}
      {showEditModal && selectedFeature && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Edit Feature: {selectedFeature.name}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feature ID</label>
                  <input
                    type="text"
                    value={featureForm.featureId}
                    onChange={(e) => setFeatureForm({...featureForm, featureId: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={featureForm.name}
                    onChange={(e) => setFeatureForm({...featureForm, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  value={featureForm.category}
                  onChange={(e) => setFeatureForm({...featureForm, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-standard-access"
                    checked={featureForm.standardAccess}
                    onChange={(e) => setFeatureForm({...featureForm, standardAccess: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-standard-access" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Standard Access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-premium-access"
                    checked={featureForm.premiumAccess}
                    onChange={(e) => setFeatureForm({...featureForm, premiumAccess: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-premium-access" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Premium Access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-admin-override"
                    checked={featureForm.adminOverride}
                    onChange={(e) => setFeatureForm({...featureForm, adminOverride: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-admin-override" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Admin Override
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpdateFeature}
                  disabled={actionLoading || !featureForm.featureId || !featureForm.name}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Feature"}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFeature(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Access Modal */}
      {showAccessModal && selectedFeature && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Manage Access: {selectedFeature.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</label>
                <input
                  type="text"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter wallet address"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={grantAccess}
                    onChange={() => setGrantAccess(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Grant Access</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!grantAccess}
                    onChange={() => setGrantAccess(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Revoke Access</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFeatureAccess}
                  disabled={actionLoading || !targetWallet}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Update Access"}
                </button>
                <button
                  onClick={() => {
                    setShowAccessModal(false);
                    setTargetWallet("");
                    setGrantAccess(true);
                    setSelectedFeature(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureManagement;
