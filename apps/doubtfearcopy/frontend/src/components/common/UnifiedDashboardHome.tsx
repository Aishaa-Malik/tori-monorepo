import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import NewAppointmentForm from '../NewAppointmentForm';

interface Transaction {
  customer: string;
  timestamp: string;
  amount: number;
}

interface Booking {
  customer: string;
  time: string;
  status: string;
}

interface DashboardProps {
  serviceType: 'doctor' | 'turf';
}

type DashboardFilter = 'today' | 'past' | 'upcoming' | 'custom';

const dashboardFilterOptions: Array<{ value: DashboardFilter; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'past', label: 'Past' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'custom', label: 'Custom' },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatBookingTime = (bookingDate: string, startTime?: string | null) => {
  const date = new Date(bookingDate);
  const dateLabel =
    date.toDateString() === new Date().toDateString()
      ? 'Today'
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  if (!startTime) return dateLabel;

  const [rawHours, minutes = '00'] = startTime.split(':');
  const hours = Number(rawHours);

  if (Number.isNaN(hours)) {
    return `${dateLabel}, ${startTime}`;
  }

  const displayHours = hours % 12 || 12;
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  return `${dateLabel}, ${displayHours}:${minutes} ${meridiem}`;
};

const getDateInputValue = (date: Date) => date.toISOString().split('T')[0];

const getDateFilter = (filter: DashboardFilter, customStart: string, customEnd: string) => {
  const today = new Date();
  const todayValue = getDateInputValue(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (filter === 'today') {
    return { from: todayValue, to: todayValue, label: 'Today' };
  }

  if (filter === 'past') {
    return { to: getDateInputValue(yesterday), label: 'Past' };
  }

  if (filter === 'upcoming') {
    return { from: todayValue, label: 'Upcoming' };
  }

  return {
    from: customStart || todayValue,
    to: customEnd || customStart || todayValue,
    label: 'Custom',
  };
};

const applyBookingDateFilter = <T,>(query: T, from?: string, to?: string): T => {
  let nextQuery: any = query;

  if (from) {
    nextQuery = nextQuery.gte('booking_date', from);
  }

  if (to) {
    nextQuery = nextQuery.lte('booking_date', to);
  }

  return nextQuery as T;
};

const DashboardCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`tori-dashboard-card rounded-[1.35rem] ${className}`}>{children}</div>
);

const UnifiedDashboardHome: React.FC<DashboardProps> = ({ serviceType }) => {
  const { user, tenant } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<DashboardFilter>('today');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [customStart, setCustomStart] = useState(getDateInputValue(new Date()));
  const [customEnd, setCustomEnd] = useState(getDateInputValue(new Date()));

  const defaultStaffCount = serviceType === 'turf' ? 2 : 3;
  const venueName = tenant?.name || user?.name || 'your venue';
  const dateFilter = getDateFilter(selectedFilter, customStart, customEnd);
  const dashboardBasePath = serviceType === 'turf' ? '/fitness-sports-dashboard' : '/dashboard';
  const selectedFilterLabel =
    dashboardFilterOptions.find((filter) => filter.value === selectedFilter)?.label || 'Today';

  const renderStatValue = (value: string) => {
    if (value.startsWith('₹')) {
      return (
        <>
          <span className="text-[0.82em] leading-none align-baseline">₹</span>
          <span>{value.slice(1)}</span>
        </>
      );
    }

    return value;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.tenantId) return;

      try {
        setIsLoading(true);

        const totalQuery = supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId);
        const { count: totalCount, error: totalError } = await applyBookingDateFilter(
          totalQuery,
          dateFilter.from,
          dateFilter.to
        );
        if (totalError) throw totalError;

        const revenueQuery = supabase
          .from('appointments')
          .select('amount')
          .eq('tenant_id', user.tenantId);
        const { data: revenueData, error: revenueError } = await applyBookingDateFilter(
          revenueQuery,
          dateFilter.from,
          dateFilter.to
        );
        if (revenueError) throw revenueError;

        const { count: staffCountResult, error: staffError } = await supabase
          .from('approved_users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenantId)
          .in('role', ['DOCTOR', 'EMPLOYEE']);
        if (staffError) throw staffError;

        const revenue =
          revenueData?.reduce((sum, appointment) => sum + (appointment.amount || 0), 0) || 0;

        setTotalBookings(totalCount || 0);
        setTodayBookings(totalCount || 0);
        setTotalRevenue(revenue);
        setStaffCount(staffCountResult || defaultStaffCount);
      } catch (error) {
        console.error('Error fetching venue dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.tenantId, defaultStaffCount, dateFilter.from, dateFilter.to]);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!user?.tenantId) return;

      try {
        setTransactionsLoading(true);

        const transactionQuery = supabase
          .from('appointments')
          .select('customer_name, booking_date, amount')
          .eq('tenant_id', user.tenantId)
          .not('amount', 'is', null)
          .order('booking_date', { ascending: false })
          .limit(4);
        const { data, error } = await applyBookingDateFilter(
          transactionQuery,
          dateFilter.from,
          dateFilter.to
        );

        if (error) throw error;

        setTransactions(
          data?.map((item) => ({
            customer: item.customer_name || 'Guest player',
            timestamp: formatDate(item.booking_date),
            amount: item.amount || 0,
          })) || []
        );
      } catch (error) {
        console.error('Error fetching venue transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [user?.tenantId, dateFilter.from, dateFilter.to]);

  const fetchUpcomingBookings = async () => {
    if (!user?.tenantId) return;

    try {
      setBookingsLoading(true);

      const bookingsQuery = supabase
        .from('appointments')
        .select('customer_name, booking_date, start_time, status')
        .eq('tenant_id', user.tenantId)
        .order('booking_date', { ascending: selectedFilter !== 'past' })
        .order('start_time', { ascending: true })
        .limit(4);
      const { data, error } = await applyBookingDateFilter(
        bookingsQuery,
        dateFilter.from,
        dateFilter.to
      );

      if (error) throw error;

      setBookings(
        data?.map((item) => ({
          customer: item.customer_name || 'Guest player',
          time: formatBookingTime(item.booking_date, item.start_time),
          status: item.status || 'Confirmed',
        })) || []
      );
    } catch (error) {
      console.error('Error fetching upcoming venue bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingBookings();
  }, [user?.tenantId, dateFilter.from, dateFilter.to, selectedFilter]);

  const statCards = [
    {
      label: 'Paid Revenue',
      value: isLoading ? '...' : `₹${totalRevenue.toLocaleString()}`,
      meta: `${dateFilter.label} revenue`,
      tone: 'from-[#dbeafe]/95 to-[#9ec7ff]/80 text-[#07111f]',
    },
    {
      label: 'Total Bookings',
      value: isLoading ? '...' : totalBookings.toString(),
      meta: `${dateFilter.label} slots`,
      tone: 'from-[#111827]/95 to-[#17233a]/90 text-white',
    },
    {
      label: 'Active Staff',
      value: isLoading ? '...' : staffCount.toString(),
      meta: 'Coaches and operators',
      tone: 'from-[#0c141f]/95 to-[#142033]/90 text-white',
    },
  ];

  return (
    <div className="h-full overflow-auto text-white">
      <div className="mx-auto flex min-h-full w-full max-w-[104rem] flex-col gap-3 px-0 pb-2 pt-1 sm:gap-4 sm:px-2 lg:pb-3">
        <header className="flex flex-col gap-4 px-1 py-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-4xl">
            <h1 className="font-tori-garamond mt-2 text-4xl font-light leading-[0.92] text-white sm:text-5xl lg:text-6xl 2xl:text-7xl">
              Welcome back, {user?.name || 'venue owner'}
            </h1>
          </div>

          <div className="relative z-50 flex flex-col gap-2 sm:max-w-xs lg:-translate-x-6 lg:items-end">
            <button
              type="button"
              onClick={() => setFilterMenuOpen((open) => !open)}
              className="tori-unstyled-button font-tori-garamond flex h-11 w-full min-w-[10rem] items-center justify-between rounded-full border border-white/12 bg-white/[0.09] py-2 pl-5 pr-4 text-xl font-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition hover:bg-white/[0.12]"
            >
              <span>{selectedFilterLabel}</span>
              <svg
                className={`ml-4 h-4 w-4 text-blue-100/80 transition ${filterMenuOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6 8 10l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {filterMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-40 overflow-hidden rounded-[1.1rem] border border-white/12 bg-[#071421]/92 p-1.5 font-tori-garamond shadow-[0_22px_58px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl">
                {dashboardFilterOptions.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(filter.value);
                      setFilterMenuOpen(false);
                    }}
                    className={`tori-unstyled-button flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left font-tori-garamond text-xl font-light transition ${
                      selectedFilter === filter.value
                        ? 'bg-[#9ed3ff]/16 text-white'
                        : 'text-blue-100/68 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    {filter.label}
                    {selectedFilter === filter.value && <span className="h-1.5 w-1.5 rounded-full bg-[#bfe4ff]" />}
                  </button>
                ))}
              </div>
            )}
            {selectedFilter === 'custom' && (
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="h-9 rounded-full border border-white/10 bg-white/[0.07] px-3 text-xs text-white"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="h-9 rounded-full border border-white/10 bg-white/[0.07] px-3 text-xs text-white"
                />
              </div>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {statCards.map((card, index) => (
            <div
              key={card.label}
              className={`relative flex min-h-[9.35rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-br ${card.tone} p-4 pb-0 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:min-h-[10.85rem]`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.22),transparent_12rem)] opacity-70" />
              <div className="relative flex min-h-full w-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-tori-garamond max-w-[70%] text-lg font-light leading-none normal-case opacity-78">
                    {card.label}
                  </p>
                  <span className="font-tori-garamond ml-auto rounded-full border border-white/14 bg-white/12 px-3 py-1 text-xs font-light leading-none normal-case opacity-75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                    {dateFilter.label}
                  </span>
                </div>
                <p className="font-tori-garamond absolute -bottom-2 left-0 text-left text-6xl font-light leading-[0.78] sm:-bottom-3 sm:text-8xl">
                  {renderStatValue(card.value)}
                </p>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowNewAppointmentForm(true)}
            className="tori-unstyled-button group relative min-h-[9.35rem] !rounded-[1.35rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0c141f]/95 to-[#142033]/90 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:from-[#111d2c]/95 hover:to-[#1a2a42]/90 sm:min-h-[10.85rem]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.22),transparent_12rem)] opacity-80" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start gap-3">
                <p className="font-tori-garamond text-lg font-light leading-none normal-case text-blue-100/78">
                  Add manual booking
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <svg className="h-16 w-16 text-white/92 transition duration-700 group-hover:rotate-[360deg] group-hover:scale-105 sm:h-24 sm:w-24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M32 12v40M12 32h40" stroke="currentColor" strokeWidth="4.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="sr-only">
                Add manual booking
              </span>
            </div>
          </button>
        </section>

        <section className="grid flex-1 grid-cols-1 gap-3 2xl:grid-cols-[1.05fr_0.95fr]">
          <DashboardCard className="flex min-h-[23rem] flex-col p-4 sm:min-h-[25rem] xl:min-h-[27rem]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-tori-garamond text-2xl font-light leading-none text-white">
                  Recent paid bookings
                </p>
              </div>
              <Link to={`${dashboardBasePath}/revenue`} className="font-tori-garamond rounded-full border border-white/10 px-3 py-1 text-xs text-blue-100/60 transition hover:bg-white/[0.06] hover:text-white">
                View all
              </Link>
            </div>

            <div className="flex flex-1 flex-col space-y-2">
              {transactionsLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/8" />
                ))
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <div
                    key={`${transaction.customer}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.045] px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-200/12 text-sm text-blue-100">
                        {transaction.customer.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white">{transaction.customer}</p>
                        <p className="text-xs text-blue-100/45">{transaction.timestamp}</p>
                      </div>
                    </div>
                    <p className="font-tori-garamond text-2xl text-white">₹{transaction.amount}</p>
                  </div>
                ))
              ) : (
                <div className="relative flex min-h-[18rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(191,228,255,0.18),transparent_14rem),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:min-h-[20rem]">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#bfe4ff]/14 blur-2xl" />
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/12 bg-[#bfe4ff]/12 text-5xl shadow-[0_18px_44px_rgba(93,169,216,0.18)]">
                    💸
                  </div>
                  <p className="font-tori-garamond mt-5 text-3xl font-light leading-none text-white sm:text-4xl">No paid bookings yet</p>
                  <p className="mx-auto mt-2 max-w-sm font-tori-garamond text-base text-blue-100/50">Your first paid slot will light this board up.</p>
                </div>
              )}
            </div>
          </DashboardCard>

          <DashboardCard className="flex min-h-[23rem] flex-col p-4 sm:min-h-[25rem] xl:min-h-[27rem]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-tori-garamond text-2xl font-light leading-none text-white">
                  Upcoming slots
                </p>
              </div>
              <Link to={`${dashboardBasePath}/schedule`} className="font-tori-garamond rounded-full border border-white/10 px-3 py-1 text-xs text-blue-100/60 transition hover:bg-white/[0.06] hover:text-white">
                View all
              </Link>
            </div>

            <div className="flex flex-1 flex-col space-y-2">
              {bookingsLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/8" />
                ))
              ) : bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <div
                    key={`${booking.customer}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.045] px-3 py-3"
                  >
                    <div>
                      <p className="text-sm text-white">{booking.customer}</p>
                      <p className="text-xs text-blue-100/45">{booking.time}</p>
                    </div>
                    <span className="rounded-full bg-emerald-300/12 px-2.5 py-1 text-xs text-emerald-100">
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="relative flex min-h-[18rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(125,255,196,0.14),transparent_14rem),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:min-h-[20rem]">
                  <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-emerald-300/12 blur-2xl" />
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/12 bg-emerald-300/12 text-5xl shadow-[0_18px_44px_rgba(16,185,129,0.14)]">
                    🗓️
                  </div>
                  <p className="font-tori-garamond mt-5 text-3xl font-light leading-none text-white sm:text-4xl">No upcoming slots</p>
                  <p className="mx-auto mt-2 max-w-sm font-tori-garamond text-base text-blue-100/50">Invite customers or add a manual booking to start.</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </section>
      </div>

      {showNewAppointmentForm && (
        <NewAppointmentForm
          onClose={() => setShowNewAppointmentForm(false)}
          onSuccess={() => {
            setShowNewAppointmentForm(false);
            fetchUpcomingBookings();
          }}
        />
      )}
    </div>
  );
};

export default UnifiedDashboardHome;
