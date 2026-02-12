import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const TurfEmployeeDashboard: React.FC = () => {
  const { user, tenant } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h2>
        <p className="text-gray-600">
          {tenant ? `${tenant.name} Dashboard` : 'Dashboard'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
          <ul className="divide-y">
            {[1, 2, 3].map((i) => (
              <li key={i} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Patient {i}</p>
                    <p className="text-sm text-gray-500">Today, 2:00 PM</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                    Confirmed
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/healthwellness-dashboard/employee/bookings">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-300">
                View Appointments
              </button>
            </Link>
            {/* <Link to="/healthwellness-dashboard/employee/revenue">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors duration-300">
                View Revenue
              </button>
            </Link> */}
            {/* <Link to="/healthwellness-dashboard/employee/users">
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition-colors duration-300">
                Manage Staff
              </button>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfEmployeeDashboard;
