import { useEffect, useState } from "react";
import { HEY_API_URL } from "@hey/data/constants";

interface AdminUser {
  walletAddress: string;
  userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
  isPremiumOnChain: boolean;
  hasLinkedProfile: boolean;
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  };
  registrationDate: Date;
  referrerAddress?: string;
  registrationTxHash?: string;
  premiumUpgradedAt?: Date;
  lastActiveAt: Date;
  totalLogins: number;
  availableFeatures: string[];
  adminNotes?: string;
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

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(null);
  const [features, setFeatures] = useState<FeatureInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Action form states
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionReason, setActionReason] = useState("");
  const [actionProfileId, setActionProfileId] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [grantFeatureAccess, setGrantFeatureAccess] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchAdminUserInfo();
    fetchFeatures();
  }, [page, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      });
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`${HEY_API_URL}/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      setUsers(data.data.users);
      setTotalPages(Math.ceil(data.data.total / 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
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

  const fetchFeatures = async () => {
    try {
      const response = await fetch(`${HEY_API_URL}/admin/features`);
      if (response.ok) {
        const data = await response.json();
        setFeatures(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch features:", err);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !adminUser || !actionReason) return;

    setActionLoading(true);
    try {
      const payload = {
        adminWalletAddress: adminUser.walletAddress,
        targetWallet: selectedUser.walletAddress,
        reason: actionReason
      };

      let endpoint = "";
      switch (actionType) {
        case "force-unlink":
          endpoint = "/admin/force-unlink-profile";
          break;
        case "grant-premium":
          endpoint = "/admin/grant-premium";
          break;
        case "force-link":
          if (!actionProfileId) throw new Error("Profile ID is required");
          endpoint = "/admin/force-link-profile";
          Object.assign(payload, { profileId: actionProfileId });
          break;
        default:
          throw new Error("Invalid action type");
      }

      const response = await fetch(`${HEY_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Action failed");

      setShowActionModal(false);
      setActionType("");
      setActionReason("");
      setActionProfileId("");
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedUser || !adminUser || !noteText) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${HEY_API_URL}/admin/add-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWalletAddress: adminUser.walletAddress,
          targetWallet: selectedUser.walletAddress,
          note: noteText,
          isPrivate: isPrivateNote
        })
      });

      if (!response.ok) throw new Error("Failed to add note");

      setShowNoteModal(false);
      setNoteText("");
      setIsPrivateNote(false);
      fetchUsers(); // Refresh to get updated notes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeatureAccess = async () => {
    if (!selectedUser || !adminUser || !selectedFeature) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${HEY_API_URL}/admin/features/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWalletAddress: adminUser.walletAddress,
          targetWallet: selectedUser.walletAddress,
          featureId: selectedFeature,
          grantAccess: grantFeatureAccess,
          reason: `Feature access ${grantFeatureAccess ? "granted" : "revoked"} by admin`
        })
      });

      if (!response.ok) throw new Error("Failed to update feature access");

      setShowFeatureModal(false);
      setSelectedFeature("");
      setGrantFeatureAccess(true);
      fetchUsers(); // Refresh to get updated features
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update feature access");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ProLinked": return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "OnChainUnlinked": return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "Standard": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const hasPermission = (permission: string) => {
    if (!adminUser) return false;
    if (adminUser.role === "SuperAdmin") return true;
    return adminUser.permissions.includes(permission);
  };

  const filteredUsers = users.filter(user =>
    user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.linkedProfile?.handle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="Standard">Standard</option>
            <option value="OnChainUnlinked">On-Chain Unlinked</option>
            <option value="ProLinked">Pro Linked</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Wallet Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.walletAddress} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    <div className="flex items-center space-x-2">
                      <span>{user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}</span>
                      {user.isPremiumOnChain && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.userStatus)}`}>
                      {user.userStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.linkedProfile ? (
                      <div>
                        <div className="font-medium">{user.linkedProfile.handle}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.linkedProfile.linkedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Not linked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(user.lastActiveAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      {hasPermission("user.force_unlink") && user.hasLinkedProfile && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType("force-unlink");
                            setShowActionModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Unlink
                        </button>
                      )}
                      {hasPermission("user.force_link") && !user.hasLinkedProfile && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType("force-link");
                            setShowActionModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Link
                        </button>
                      )}
                      {hasPermission("user.grant_premium") && !user.isPremiumOnChain && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType("grant-premium");
                            setShowActionModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          Grant Premium
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                User Details: {selectedUser.walletAddress.slice(0, 8)}...{selectedUser.walletAddress.slice(-6)}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.userStatus)}`}>
                      {selectedUser.userStatus}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Premium On-Chain</label>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedUser.isPremiumOnChain ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Date</label>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(selectedUser.registrationDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Active</label>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(selectedUser.lastActiveAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {selectedUser.linkedProfile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Linked Profile</label>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <div>Handle: {selectedUser.linkedProfile.handle}</div>
                      <div>Linked: {new Date(selectedUser.linkedProfile.linkedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                {selectedUser.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes</label>
                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedUser.adminNotes}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Available Features</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.availableFeatures.map((feature) => (
                      <span key={feature} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  {hasPermission("user.add_note") && (
                    <button
                      onClick={() => setShowNoteModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  )}
                  {hasPermission("feature.manage") && (
                    <button
                      onClick={() => setShowFeatureModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Manage Features
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {actionType === "force-unlink" && "Force Unlink Profile"}
              {actionType === "force-link" && "Force Link Profile"}
              {actionType === "grant-premium" && "Grant Premium Access"}
            </h3>
            
            <div className="space-y-4">
              {actionType === "force-link" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile ID</label>
                  <input
                    type="text"
                    value={actionProfileId}
                    onChange={(e) => setActionProfileId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter profile ID"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter reason for this action"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAction}
                  disabled={actionLoading || !actionReason}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setActionType("");
                    setActionReason("");
                    setActionProfileId("");
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

      {/* Note Modal */}
      {showNoteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Add Admin Note</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter admin note"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="private-note"
                  checked={isPrivateNote}
                  onChange={(e) => setIsPrivateNote(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="private-note" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Private note (only visible to admins)
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAddNote}
                  disabled={actionLoading || !noteText}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add Note"}
                </button>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteText("");
                    setIsPrivateNote(false);
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

      {/* Feature Modal */}
      {showFeatureModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Manage Feature Access</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feature</label>
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a feature</option>
                  {features.map((feature) => (
                    <option key={feature.id} value={feature.featureId}>
                      {feature.name} ({feature.category})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={grantFeatureAccess}
                    onChange={() => setGrantFeatureAccess(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Grant Access</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!grantFeatureAccess}
                    onChange={() => setGrantFeatureAccess(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Revoke Access</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFeatureAccess}
                  disabled={actionLoading || !selectedFeature}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Update Access"}
                </button>
                <button
                  onClick={() => {
                    setShowFeatureModal(false);
                    setSelectedFeature("");
                    setGrantFeatureAccess(true);
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

export default UserManagement;
