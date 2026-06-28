import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import { UserData, UserManagementProps } from '../../types/userManagement.types';
import { getServiceConfig } from '../../config/userManagementConfig';

const UnifiedUserManagement: React.FC<UserManagementProps> = ({ serviceType, config }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<UserData | null>(null);

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

  const handleDelete = async (targetUser: UserData) => {
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
          .eq('user_id', targetUser.id);

        if (tenantError) throw tenantError;
      }

      // Update local state
      setUsers(users.filter(user => user.id !== targetUser.id));
      setRemoveTarget(null);
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
        return 'Coach';
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
    <div className="space-y-4 px-1 py-4 sm:px-2 lg:px-3">
      {/* Header section */}
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="font-tori-garamond text-5xl font-light leading-[0.95] text-white sm:text-6xl xl:text-7xl">
            {serviceConfig.title}
          </h2>
          {serviceConfig.description && (
            <p className="font-tori-garamond mt-2 text-2xl italic leading-tight text-blue-100/45 sm:text-3xl">
              {serviceConfig.description}
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-red-100">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-2xl border border-[#b9ddff]/18 bg-[#9ed3ff]/10 p-4 text-blue-100/80">
          Loading users...
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-[1.2rem] border border-white/10 bg-[#030812]/68 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.18)] backdrop-blur-xl md:flex-row md:items-center">
        <input
          type="search"
          placeholder="Search users by name or email"
          className="w-full rounded-full border border-white/10 bg-white/[0.065] px-5 py-2.5 text-sm text-white placeholder:text-blue-100/38 focus:border-[#9ed3ff]/45 focus:outline-none focus:ring-2 focus:ring-[#9ed3ff]/18 md:w-[40%]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => setShowInviteModal(true)}
          className="tori-unstyled-button inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] py-2 pl-2 pr-4 text-sm font-semibold normal-case text-white transition hover:bg-white/[0.1] md:ml-auto"
        >
          <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3efe8] text-[#111827]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </span>
          Invite User
        </button>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#030812]/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <table className="min-w-full table-fixed divide-y divide-white/8">
          <colgroup>
            <col className="w-[36%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-white/[0.035]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-blue-100/45">User</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-blue-100/45">Role</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-blue-100/45">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.12em] text-blue-100/45">Date Added</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-blue-100/45">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-blue-100/50">
                  {isLoading ? 'Loading users...' : 'No users found'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="transition hover:bg-white/[0.025]">
                  <td className="px-6 py-5 align-middle">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${
                        user.status === 'active' ? 'bg-[#d8ecff]' : 'bg-[#f3efe8]'
                      }`}>
                        <span className={`font-medium ${
                          user.status === 'active' ? 'text-[#2d4c74]' : 'text-[#3a332a]'
                        }`}>
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4 min-w-0 text-left">
                        <div className="truncate text-base font-semibold text-white">
                          {user.full_name || user.email.split('@')[0]}
                        </div>
                        <div className="mt-1 truncate text-sm text-blue-100/34">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    {user.status === 'active' ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-sm text-white focus:border-[#9ed3ff]/45 focus:outline-none"
                      >
                        {serviceConfig.availableRoles.map(role => (
                          <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-blue-100/58">{getRoleDisplayName(user.role)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-emerald-300/14 text-emerald-100' 
                        : 'bg-[#f3efe8]/12 text-[#f3efe8]'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Pending Invitation'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center align-middle text-sm text-blue-100/52">
                    {user.status === 'pending' ? user.invitation_date : user.created_at}
                  </td>
                  <td className="px-6 py-4 text-right align-middle text-sm font-medium">
                    <button
                      onClick={() => setRemoveTarget(user)}
                      className="tori-unstyled-button inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200/16 bg-red-400/8 text-red-100/80 transition hover:bg-red-400/14 hover:text-white"
                      aria-label={`${user.status === 'pending' ? 'Cancel invitation for' : 'Remove'} ${user.full_name || user.email}`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4.25 4.25 11.75 11.75M11.75 4.25 4.25 11.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-white/12 bg-[#071421]/95 p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <h3 className="font-tori-garamond text-4xl font-light">Invite User</h3>
            <p className="mt-1 text-sm text-blue-100/55">Add a team member to your sports venue dashboard.</p>
            <form onSubmit={handleInviteSubmit}>
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-blue-100/70">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.065] px-4 py-3 text-sm text-white placeholder:text-blue-100/38 focus:border-[#9ed3ff]/45 focus:outline-none focus:ring-2 focus:ring-[#9ed3ff]/18"
                  placeholder="user@example.com"
                />
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-blue-100/70">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.065] px-4 py-3 text-sm text-white focus:border-[#9ed3ff]/45 focus:outline-none focus:ring-2 focus:ring-[#9ed3ff]/18"
                >
                  {serviceConfig.availableRoles.map(role => (
                    <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="tori-unstyled-button rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-blue-100/80 transition hover:bg-white/[0.08] hover:text-white"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="tori-unstyled-button rounded-full bg-[#f3efe8] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-white disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-white/12 bg-[#071421]/95 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <h3 className="text-lg font-semibold">
              {removeTarget.status === 'pending' ? 'Cancel invitation?' : 'Remove user?'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-blue-100/62">
              Are you sure you want to {removeTarget.status === 'pending' ? 'cancel the invitation for' : 'remove'}{' '}
              <span className="font-semibold text-white">{removeTarget.full_name || removeTarget.email}</span>
              {removeTarget.status === 'active' ? ' from this venue?' : '?'}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className="tori-unstyled-button flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-blue-100/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(removeTarget)}
                className="tori-unstyled-button flex-1 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-900 transition hover:bg-white"
              >
                {removeTarget.status === 'pending' ? 'Cancel Invite' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedUserManagement;