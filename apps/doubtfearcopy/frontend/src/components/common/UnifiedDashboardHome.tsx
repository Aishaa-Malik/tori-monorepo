import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import NewAppointmentForm from '../NewAppointmentForm';

// Data Interfaces
interface Transaction {
  patient: string;
  timestamp: string;
  amount: number;
}

interface Appointment {
  patient: string;
  time: string;
  status: string;
}

interface DashboardProps {
  serviceType: 'doctor' | 'turf';
}

const UnifiedDashboardHome: React.FC<DashboardProps> = ({ serviceType }) => {
  const { user, tenant } = useAuth();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);

  // Get service-specific configuration
  const getServiceConfig = () => {
    switch (serviceType) {
      case 'doctor':
        return {
          welcomeMessage: 'Welcome back,',
          bookingLabel: 'Bookings',
          staffLabel: 'Staff',
          showNewAppointmentButton: true,
          defaultStaffCount: 3
        };
      case 'turf':
        return {
          welcomeMessage: 'Welcome back',
          bookingLabel: 'Bookings',
          staffLabel: 'Staff',
          showNewAppointmentButton: true,
          defaultStaffCount: 2
        };
      default:
        return {
          welcomeMessage: 'Welcome back,',
          bookingLabel: 'Bookings',
          staffLabel: 'Staff',
          showNewAppointmentButton: false,
          defaultStaffCount: 0
        };
    }
  };

  const config = getServiceConfig();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId || !user?.id) return;
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // Fetch total appointments
        const { count: totalCount, error: totalError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);
        if (totalError) throw totalError;
        
        setTotalAppointments(totalCount || 0);

        // Fetch today's appointments (for turf dashboard)
        const { count: todayCount, error: todayError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .eq('booking_date', today);
        if (todayError) throw todayError;
        
        setTodayAppointments(todayCount || 0);

        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('appointments')
          .select('amount')
          .eq('tenant_id', user.tenantId);
        if (revenueError) throw revenueError;
        
        const revenue = revenueData?.reduce((sum, appointment) => {
          return sum + (appointment.amount || 0);
        }, 0) || 0;
        
        setTotalRevenue(revenue);

        // Fetch staff count for tenant (doctors + employees)
        const { count: staffCountResult, error: staffError } = await supabase
          .from('approved_users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .in('role', ['DOCTOR', 'EMPLOYEE']);
        if (staffError) throw staffError;
        setStaffCount(staffCountResult || config.defaultStaffCount);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.tenantId, user?.id, config.defaultStaffCount]);
  
  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!user?.tenantId) return;
      
      try {
        setTransactionsLoading(true);
        
        const { data, error } = await supabase
          .from('appointments')
          .select('id, customer_name, booking_date, amount, status')
          .eq('tenant_id', user.tenantId)
          .not('amount', 'is', null)
          .order('booking_date', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        // Format the data for display
        const formattedTransactions = data?.map(item => {
          // Convert UTC date to IST for display
          const date = new Date(item.booking_date);
          const istOffset = 5.5 * 60 * 60 * 1000;
          const istDate = new Date(date.getTime() + istOffset);
          
          const formattedDate = istDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          return {
            patient: item.customer_name,
            timestamp: formattedDate,
            amount: item.amount || 0
          };
        }) || [];
        
        setTransactions(formattedTransactions);
      } catch (err: any) {
        console.error('Error fetching recent transactions:', err);
      } finally {
        setTransactionsLoading(false);
      }
    };
    
    fetchRecentTransactions();
  }, [user?.tenantId]);
  
  // Fetch upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      if (!user?.tenantId) return;
      
      try {
        setAppointmentsLoading(true);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('appointments')
          .select('id, customer_name, booking_date, start_time, status')
          .eq('tenant_id', user.tenantId)
          .gte('booking_date', today.toISOString().split('T')[0])
          .eq('status', 'Scheduled')
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(3);
        
        if (error) throw error;
        
        // Format the data for display
        const formattedAppointments = data?.map(item => {
          // Check if the appointment is today
          const appointmentDate = new Date(item.booking_date);
          const isToday = appointmentDate.toDateString() === today.toDateString();
          
          // Format the time (assuming start_time is in HH:MM format)
          const timeParts = item.start_time.split(':');
          const hours = parseInt(timeParts[0]);
          const minutes = timeParts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12;
          const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
          
          // Format the date display
          const dateDisplay = isToday ? 'Today' : appointmentDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          return {
            patient: item.customer_name,
            time: `${dateDisplay}, ${formattedTime}`,
            status: 'Confirmed'
          };
        }) || [];
        
        setAppointments(formattedAppointments);
      } catch (err: any) {
        console.error('Error fetching upcoming appointments:', err);
      } finally {
        setAppointmentsLoading(false);
      }
    };
    
    fetchUpcomingAppointments();
  }, [user?.tenantId]);

  const refreshAppointments = async () => {
    if (!user?.tenantId) return;
    
    try {
      setAppointmentsLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('id, customer_name, booking_date, start_time, status')
        .eq('tenant_id', user.tenantId)
        .gte('booking_date', today.toISOString().split('T')[0])
        .eq('status', 'Scheduled')
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      
      // Format the data for display
      const formattedAppointments = data?.map(item => {
        // Check if the appointment is today
        const appointmentDate = new Date(item.booking_date);
        const isToday = appointmentDate.toDateString() === today.toDateString();
        
        // Format the time (assuming start_time is in HH:MM format)
        const timeParts = item.start_time.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
        
        // Format the date display
        const dateDisplay = isToday ? 'Today' : appointmentDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        return {
          patient: item.customer_name,
          time: `${dateDisplay}, ${formattedTime}`,
          status: 'Confirmed'
        };
      }) || [];
      
      setAppointments(formattedAppointments);
    } catch (err: any) {
      console.error('Error fetching upcoming appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Render different layouts based on service type
  const renderDashboard = () => {
    if (serviceType === 'turf') {
      return (
        <div className="h-full w-full p-0 pt-0 flex flex-col items-center justify-start overflow-auto">
          <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-2 px-0 pt-2">
            <div className="flex flex-col items-start">
              <div className="text-1xl text-gray-300 opacity-70 pl-0 text-left">{config.welcomeMessage}</div>
              <div className="flex items-center">
                <h1 className="text-6xl font-bold text-white">{user?.name || 'Aisha'}</h1>
                <span className="text-5xl ml-2">👋🏻</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
                Home
              </div>
              <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
                Page 1
              </div>
            </div>
          </div>
          
          <div className="w-full max-w-6xl mx-auto rounded-2xl p-0 pt-3 overflow-auto">
            <div className="grid grid-cols-12 gap-3 w-full">
              {renderStatsCards()}
            </div>
          </div>
        </div>
      );
    }

    // Doctor dashboard layout
    return (
      <div className="grid grid-cols-12 gap-3 max-w-6xl mx-auto w-full">
        {/* Welcome Message */}
        <div className="col-span-12 mb-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">{config.welcomeMessage}</h1>
            <h1 className="text-3xl font-bold text-white ml-2">{user?.name || 'Aisha'}</h1>
            <span className="text-3xl ml-2">👋🏻</span>
          </div>
        </div>
        {renderStatsCards()}
      </div>
    );
  };

  const renderStatsCards = () => {
    return (
      <>
        {/* STATS CARDS */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-60 backdrop-blur-md rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-medium text-black">Revenue</div>
            <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">Total earnings</div>
          </div>
          <div className="mt-auto mb-2 self-start">
            <div className="text-6xl font-bold text-black">
              {isLoading ? <div className="animate-pulse h-12 w-32 bg-gray-700 rounded"></div> : `₹${totalRevenue.toLocaleString()}`}
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-medium text-white">{config.bookingLabel}</div>
            <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">All time</div>
          </div>
          <div className="mt-auto mb-2 self-start">
            <div className="text-6xl font-bold text-white">
              {isLoading ? <div className="animate-pulse h-12 w-24 bg-gray-700 rounded"></div> : totalAppointments}
            </div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-medium text-white">{config.staffLabel}</div>
            <div className="bg-white bg-opacity-10 px-2 py-1 rounded-full text-xs text-gray-300">
              {serviceType === 'turf' ? 'Today' : 'Total'}
            </div>
          </div>
          <div className="mt-auto mb-2 self-start">
            <div className="text-6xl font-bold text-white">
              {isLoading ? (
                <div className="animate-pulse h-12 w-24 bg-gray-700 rounded"></div>
              ) : (
                serviceType === 'turf' ? todayAppointments : staffCount
              )}
            </div>
          </div>
        </div>

        {config.showNewAppointmentButton ? (
          <div 
            className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all"
            onClick={() => setShowNewAppointmentForm(true)}
          >
            <div className="relative w-20 h-20">
              <div className="absolute top-1/2 left-0 w-full h-2 bg-white transform -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 w-2 h-full bg-white transform -translate-x-1/2"></div>
            </div>
          </div>
        ) : (
          <div className="col-span-12 sm:col-span-6 md:col-span-3 h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all">
            <div className="relative w-20 h-20">
              <div className="absolute top-1/2 left-0 w-full h-2 bg-white transform -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 w-2 h-full bg-white transform -translate-x-1/2"></div>
            </div>
          </div>
        )}
        
        {showNewAppointmentForm && (
          <NewAppointmentForm
            onClose={() => setShowNewAppointmentForm(false)}
            onSuccess={() => {
              setShowNewAppointmentForm(false);
              refreshAppointments();
            }}
          />
        )}

        {/* RECENT TRANSACTIONS */}
        <div className="col-span-6">
          <div className="bg-black bg-opacity-60 backdrop-blur-md rounded-xl p-5 h-full">
            <div className="flex justify-between items-center mb-2">
              <div className="text-lg font-medium text-white">Recent Transactions</div>
              <div className="text-sm text-gray-400">View All</div>
            </div>
            <div className="space-y-3">
              {transactionsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-700 mr-3"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-gray-700 rounded"></div>
                  </div>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs mr-3">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>
                        <div className="text-xl text-white">{transaction.patient}</div>
                        <div className="text-sm text-gray-400">{transaction.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-xl text-white">₹{transaction.amount}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No transactions found</div>
              )}
            </div>
          </div>
        </div>

        {/* UPCOMING APPOINTMENTS */}
        <div className="col-span-6">
          <div className="bg-white bg-opacity-60 backdrop-blur-md rounded-xl p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-medium text-black">Upcoming Appointments</div>
              <div className="text-sm text-gray-400">View All</div>
            </div>
            {appointmentsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : appointments.length > 0 ? (
              appointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xl text-black">{appointment.patient}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {appointment.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[calc(100%-2rem)] flex items-center justify-center">
                <div className="text-gray-500 text-xl">No appointments scheduled</div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return renderDashboard();
};

export default UnifiedDashboardHome;