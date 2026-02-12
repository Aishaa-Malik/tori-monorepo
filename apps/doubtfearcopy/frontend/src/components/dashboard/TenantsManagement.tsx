import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface TenantData {
  id: string;
  name: string;
  email: string;
  ownerName: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  usersCount: number;
}

const TenantsManagement: React.FC = () => {
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    email: '',
    ownerName: '',
    subscriptionPlan: 'basic' as 'basic'
  });
  
  // Mock data - would be fetched from API in a real application
  const [tenants, setTenants] = useState<TenantData[]>([
    {
      id: '1',
      name: 'City Hospital',
      email: 'admin@cityhospital.com',
      ownerName: 'Dr. Robert Smith',
      subscriptionPlan: 'premium',
      status: 'active',
      createdAt: '2023-05-15',
      usersCount: 24
    },
    {
      id: '2',
      name: 'Wellness Clinic',
      email: 'contact@wellnessclinic.com',
      ownerName: 'Dr. Sarah Johnson',
      subscriptionPlan: 'basic',
      status: 'active',
      createdAt: '2023-06-22',
      usersCount: 8
    },
    {
      id: '3',
      name: 'MediCare Center',
      email: 'info@medicare.com',
      ownerName: 'Dr. James Wilson',
      subscriptionPlan: 'enterprise',
      status: 'active',
      createdAt: '2023-04-10',
      usersCount: 36
    },
    {
      id: '4',
      name: 'Health First',
      email: 'admin@healthfirst.com',
      ownerName: 'Dr. Emily Brown',
      subscriptionPlan: 'premium',
      status: 'pending',
      createdAt: '2023-10-05',
      usersCount: 0
    },
    {
      id: '5',
      name: 'Family Care',
      email: 'contact@familycare.com',
      ownerName: 'Dr. Michael Davis',
      subscriptionPlan: 'basic',
      status: 'suspended',
      createdAt: '2023-02-18',
      usersCount: 12
    }
  ]);

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would call an API to create a new tenant
    const newTenant: TenantData = {
      id: `${tenants.length + 1}`,
      name: newTenantData.name,
      email: newTenantData.email,
      ownerName: newTenantData.ownerName,
      subscriptionPlan: newTenantData.subscriptionPlan,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      usersCount: 0
    };
    
    setTenants([...tenants, newTenant]);
    setNewTenantData({
      name: '',
      email: '',
      ownerName: '',
      subscriptionPlan: 'basic'
    });
    setShowAddTenantModal(false);
  };

  const handleStatusChange = (tenantId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    setTenants(
      tenants.map(tenant => 
        tenant.id === tenantId ? { ...tenant, status: newStatus } : tenant
      )
    );
  };

  const handleSubscriptionChange = (tenantId: string, newPlan: 'basic' | 'premium' | 'enterprise') => {
    setTenants(
      tenants.map(tenant => 
        tenant.id === tenantId ? { ...tenant, subscriptionPlan: newPlan } : tenant
      )
    );
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionBadgeClass = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tenants Management</h2>
          <p className="text-gray-600">
            Manage hospitals and clinics on the platform
          </p>
        </div>
        <button
          onClick={() => setShowAddTenantModal(true)}
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Tenant
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search tenants by name, email, or owner"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="border border-gray-300 rounded-md py-2 px-3 text-sm">
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select className="border border-gray-300 rounded-md py-2 px-3 text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={tenant.subscriptionPlan}
                      onChange={(e) => handleSubscriptionChange(tenant.id, e.target.value as 'basic' | 'premium' | 'enterprise')}
                      className={`border rounded-md py-1 px-2 text-sm ${getSubscriptionBadgeClass(tenant.subscriptionPlan)}`}
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={tenant.status}
                      onChange={(e) => handleStatusChange(tenant.id, e.target.value as 'active' | 'pending' | 'suspended')}
                      className={`border rounded-md py-1 px-2 text-sm ${getStatusBadgeClass(tenant.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.usersCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Tenant</h3>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTenantSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital/Clinic Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({...newTenantData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newTenantData.email}
                  onChange={(e) => setNewTenantData({...newTenantData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={newTenantData.ownerName}
                  onChange={(e) => setNewTenantData({...newTenantData, ownerName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select
                  id="subscriptionPlan"
                  value={newTenantData.subscriptionPlan}
                  onChange={(e) => setNewTenantData({...newTenantData, subscriptionPlan: e.target.value as 'basic'})}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="basic">Basic</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsManagement; 