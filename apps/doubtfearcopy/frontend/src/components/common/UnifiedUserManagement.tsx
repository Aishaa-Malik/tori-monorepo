import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import { UserData, UserProfile, ApprovedUser, UserManagementProps } from '../../types/userManagement.types';
import { getServiceConfig } from '../../config/userManagementConfig';

const UnifiedUserManagement: React.FC<UserManagementProps> = ({ serviceType, config }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { tenant, user } = useAuth();
  const serviceConfig = { ...getServiceConfig(serviceType), ...config };

  // Set default role based on service configuration
  useEffect(() => {
    setInviteRole(serviceConfig.defaultRole);
  }, [serviceConfig.defaultRole]);

  // Fetch both active users and pending invitations
  useEffect(() => {
    fetchUsers();
  }, [user?.tenantId, serviceType]);

  const getApprovedUsersTable = () => {
    switch (serviceType) {
      case 'turf':
        return 'turf_approved_users';
      case 'spa':
        return 'spa_approved_users';
      case 'health_fitness':
        return 'health_fitness_approved_users';
      default:
        return 'approved_users';
    }
  };

  const fetchUsers = async () => {
    const actualTenantId = user?.tenantId;
    
    console.log('Current tenant:', tenant);
    console.log('Current user:', user);
    console.log('Using tenant ID:', actualTenantId);
    console.log('Service type:', serviceType);
    
    if (!actualTenantId) {
      console.log('No tenant ID available');
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get tenant associations using the correct tenant ID
      const { data: tenantUsers, error: tenantError } = await supabase
        .from('user_tenants')
        .select('user_id')
        .eq('tenant_id', actualTenantId);

      if (tenantError) throw tenantError;

      console.log('Tenant users:', tenantUsers);

      if (!tenantUsers || tenantUsers.length === 0) {
        console.log('No users found for this tenant');
        setUsers([]);
        return;
      }

      // Step 2: Get user profiles for these specific users only
      const tenantUserIds = tenantUsers.map(tu => tu.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, created_at')
        .in('id', tenantUserIds);

      if (profilesError) throw profilesError;

      console.log('User profiles:', profiles);

      // Step 3: Get roles for these users separately to avoid foreign key issues
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', tenantUserIds);

      if (rolesError) throw rolesError;

      console.log('User roles:', userRoles);

      // Step 4: Create a map of user roles for easy lookup
      const rolesMap = new Map();
      userRoles?.forEach(ur => {
        rolesMap.set(ur.user_id, ur.role);
      });

      // Step 5: Fetch pending invitations using the correct table and tenant ID
      const approvedUsersTable = getApprovedUsersTable();
      const { data: pendingUsers, error: pendingError } = await supabase
        .from(approvedUsersTable)
        .select('email, role, created_at, activated_at')
        .eq('tenant_id', actualTenantId)
        .is('activated_at', null);

      if (pendingError) throw pendingError;

      console.log('Pending users:', pendingUsers);

      // Step 6: Transform active users
      const activeUsers: UserData[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: rolesMap.get(profile.id) || UserRole.EMPLOYEE,
        status: 'active' as const,
        created_at: new Date(profile.created_at).toLocaleDateString()
      }));

      // Step 7: Transform pending invitations
      const pendingInvitations: UserData[] = (pendingUsers || []).map(pending => ({
        id: `pending-${pending.email}`,
        email: pending.email,
        full_name: undefined,
        role: pending.role,
        status: 'pending' as const,
        created_at: new Date(pending.created_at).toLocaleDateString(),
        invitation_date: new Date(pending.created_at).toLocaleDateString()
      }));

      // Step 8: Filter out duplicates
      const activeEmails = new Set(activeUsers.map(u => u.email));
      const uniquePendingInvitations = pendingInvitations.filter(
        pending => !activeEmails.has(pending.email)
      );

      // Step 9: Combine both lists
      const finalUsers = [...activeUsers, ...uniquePendingInvitations];
      setUsers(finalUsers);

      console.log('Final users list:', finalUsers);

    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(`Failed to fetch users: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const adminTenantId = user?.tenantId;
      
      if (!adminTenantId) {
        throw new Error('Unable to determine your organization. Please contact support.');
      }
      
      console.log('Sending invitation with tenant ID:', adminTenantId);
      
      // Check if user already exists (either active or pending)
      const existingActiveUser = users.find(u => u.email === inviteEmail && u.status === 'active');
      const existingPendingUser = users.find(u => u.email === inviteEmail && u.status === 'pending');
      
      if (existingActiveUser) {
        throw new Error('User is already active in your organization');
      }
      
      if (existingPendingUser) {
        throw new Error('User already has a pending invitation');
      }
      
      // Insert with the correct tenant_id and table
      const approvedUsersTable = getApprovedUsersTable();
      const { error: insertError } = await supabase
        .from(approvedUsersTable)
        .insert({
          email: inviteEmail,
          role: inviteRole,
          tenant_id: adminTenantId,
          added_by: user?.id
        });
      
      if (insertError) throw insertError;
      
      // Success cleanup
      setInviteEmail('');
      setInviteRole(serviceConfig.defaultRole);
      setShowInviteModal(false);
      await fetchUsers(); // Refresh the list to show new pending invitation
      
      alert(`✅ Invitation sent to ${inviteEmail}! They will appear as pending until they sign in with Google.`);
      
    } catch (err: any) {
      console.error('❌ Invitation error:', err);
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || targetUser.status === 'pending') {
      setError('Cannot change role for pending users');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role');
    }
  };

  const handleDelete = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const confirmMessage = targetUser.status === 'pending' 
      ? 'Are you sure you want to cancel this invitation?' 
      : 'Are you sure you want to remove this user?';
      
    if (!window.confirm(confirmMessage)) return;

    try {
      if (targetUser.status === 'pending') {
        // Delete from the appropriate approved_users table for pending invitations
        const approvedUsersTable = getApprovedUsersTable();
        const { error } = await supabase
          .from(approvedUsersTable)
          .delete()
          .eq('email', targetUser.email)
          .eq('tenant_id', user?.tenantId);

        if (error) throw error;
      } else {
        // Remove active user from tenant
        const { error: tenantError } = await supabase
          .from('user_tenants')  
          .delete()
          .eq('user_id', userId);

        if (tenantError) throw tenantError;
      }

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(targetUser.status === 'pending' ? 'Failed to cancel invitation' : 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.DOCTOR:
        return 'Doctor';
      case UserRole.BUSINESS_OWNER:
        return 'Business Owner';
      case UserRole.EMPLOYEE:
        return 'Employee';
      case UserRole.BUSINESS_ADMIN:
        return 'Business Admin';
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      default:
        return role;
    }
  };

  return (
    <div>
      {/* Header section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{serviceConfig.title}</h2>
          {serviceConfig.description && (
            <p className="text-gray-600">{serviceConfig.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Invite User
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4">
          Loading users...
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search users by name or email"
              className="w-full px-4 py-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {isLoading ? 'Loading users...' : 'No users found'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        user.status === 'active' ? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        <span className={`font-medium ${
                          user.status === 'active' ? 'text-blue-800' : 'text-yellow-800'
                        }`}>
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.email.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="border rounded-md py-1 px-2"
                      >
                        {serviceConfig.availableRoles.map(role => (
                          <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600">{getRoleDisplayName(user.role)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Pending Invitation'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.status === 'pending' ? user.invitation_date : user.created_at}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {user.status === 'pending' ? 'Cancel' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Invite New User</h3>
            <form onSubmit={handleInviteSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {serviceConfig.availableRoles.map(role => (
                    <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedUserManagement;