import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import { REVENUE_CONFIGS } from '../../config/revenueConfig';
import { 
  Transaction, 
  RevenueMetrics, 
  FilterType, 
  CustomDateRange, 
  DateRangeResult 
} from '../../types/revenue.types';
import { ServiceType } from '../../types/booking.types';

interface UnifiedRevenuePageProps {
  serviceType: ServiceType;
}

const UnifiedRevenuePage: React.FC<UnifiedRevenuePageProps> = ({ serviceType }) => {
  const config = REVENUE_CONFIGS[serviceType];
  const { tenant, user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    revenue: 0,
    count: 0,
    period: 'Today',
    dateRange: ''
  });
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('daily');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to dynamically get field values
  const getFieldValue = (transaction: Transaction, fieldType: 'name' | 'email' | 'contact'): string => {
    const fieldMap = {
      name: config.fields.customerName,
      email: config.fields.customerEmail,
      contact: config.fields.customerContact
    };
    return transaction[fieldMap[fieldType]] || '';
  };

  // Helper function to convert IST date to UTC boundaries
  const getISTDateRange = (): DateRangeResult => {
    // Get current IST time (UTC + 5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const nowIST = new Date(now.getTime() + istOffset);
    
    switch (selectedFilter) {
      case 'daily': {
        // Today in IST: 00:00:00 to 23:59:59
        const startIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 0, 0, 0, 0);
        const endIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59, 999);
        
        // Convert back to UTC for database query
        const startUTC = new Date(startIST.getTime() - istOffset);
        const endUTC = new Date(endIST.getTime() - istOffset);
        
        return {
          startDate: startUTC,
          endDate: endUTC,
          label: 'Today',
          dateRange: `${nowIST.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}`
        };
      }
      
      case 'weekly': {
        // Last 7 days including today in IST
        const endIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59, 999);
        const startIST = new Date(endIST.getTime() - (6 * 24 * 60 * 60 * 1000)); // 6 days ago + today
        startIST.setHours(0, 0, 0, 0);
        
        const startUTC = new Date(startIST.getTime() - istOffset);
        const endUTC = new Date(endIST.getTime() - istOffset);
        
        return {
          startDate: startUTC,
          endDate: endUTC,
          label: 'Last 7 Days',
          dateRange: `${new Date(startIST.getTime() - istOffset).toLocaleDateString('en-IN')} - ${new Date(endIST.getTime() - istOffset).toLocaleDateString('en-IN')}`
        };
      }
      
      case 'monthly': {
        // Last 30 days including today in IST
        const endIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59, 999);
        const startIST = new Date(endIST.getTime() - (29 * 24 * 60 * 60 * 1000)); // 29 days ago + today
        startIST.setHours(0, 0, 0, 0);
        
        const startUTC = new Date(startIST.getTime() - istOffset);
        const endUTC = new Date(endIST.getTime() - istOffset);
        
        return {
          startDate: startUTC,
          endDate: endUTC,
          label: 'Last 30 Days',
          dateRange: `${new Date(startIST.getTime() - istOffset).toLocaleDateString('en-IN')} - ${new Date(endIST.getTime() - istOffset).toLocaleDateString('en-IN')}`
        };
      }
      
      case 'custom': {
        if (customDateRange.startDate && customDateRange.endDate) {
          // Parse custom dates as IST dates
          const startIST = new Date(customDateRange.startDate + 'T00:00:00');
          const endIST = new Date(customDateRange.endDate + 'T23:59:59.999');
          
          // Convert to UTC
          const startUTC = new Date(startIST.getTime() - istOffset);
          const endUTC = new Date(endIST.getTime() - istOffset);
          
          return {
            startDate: startUTC,
            endDate: endUTC,
            label: 'Custom Range',
            dateRange: `${customDateRange.startDate} - ${customDateRange.endDate}`
          };
        }
        // Fallback to today
        const fallbackStartIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 0, 0, 0, 0);
        const fallbackEndIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59, 999);
        const fallbackStartUTC = new Date(fallbackStartIST.getTime() - istOffset);
        const fallbackEndUTC = new Date(fallbackEndIST.getTime() - istOffset);
        
        return {
          startDate: fallbackStartUTC,
          endDate: fallbackEndUTC,
          label: 'Custom Range (Select Dates)',
          dateRange: 'Please select dates'
        };
      }
      
      default: {
        const defaultStartIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 0, 0, 0, 0);
        const defaultEndIST = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate(), 23, 59, 59, 999);
        const defaultStartUTC = new Date(defaultStartIST.getTime() - istOffset);
        const defaultEndUTC = new Date(defaultEndIST.getTime() - istOffset);
        
        return {
          startDate: defaultStartUTC,
          endDate: defaultEndUTC,
          label: 'Today',
          dateRange: `${nowIST.toLocaleDateString('en-IN')}`
        };
      }
    }
  };

  useEffect(() => {
    fetchRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, customDateRange, user?.tenantId]);

  const fetchRevenueData = async () => {
    if (!user?.tenantId) {
      console.error('No tenant ID available for fetching revenue data');
      setError('No tenant ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const dateRange = getISTDateRange();
      
      console.log('Revenue Query Debug:', {
        filter: selectedFilter,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        label: dateRange.label,
        tenantId: user.tenantId,
        tableName: config.tableName
      });
      
      const selectFields = [
        'id',
        config.fields.customerName,
        config.fields.customerContact,
        'booking_date',
        'payment_method',
        'amount',
        'currency',
        'status',
        'created_at',
        'booking_reference'
      ].join(', ');

      const { data: periodTransactions, error: transactionError } = await supabase
        .from(config.tableName)
        .select(selectFields)
        .eq('tenant_id', user.tenantId)
        .gte('booking_date', dateRange.startDate.toISOString())
        .lte('booking_date', dateRange.endDate.toISOString())
        .not('amount', 'is', null)
        .in('status', ['Scheduled', 'Completed', 'paid'])
        .order('booking_date', { ascending: false });

      console.log('periodTransactions:', periodTransactions);

      if (transactionError) {
        console.error('Supabase Query Error:', transactionError);
        throw transactionError;
      }

      console.log('Query Results:', {
        totalFound: periodTransactions?.length || 0,
        transactions: periodTransactions,
        query: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          statuses: ['Scheduled', 'Completed', 'paid']
        }
      });

      // Set all transactions for the period
      setTransactions((periodTransactions as unknown as Transaction[]) || []);
      setTransactions((periodTransactions as unknown as Transaction[]) || []);

      // Calculate metrics for the selected period
      calculateMetrics((periodTransactions as unknown as Transaction[]) || [], dateRange);

    } catch (err: any) {
      console.error('Error fetching revenue data:', err);
      setError(`Failed to load revenue data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = (data: Transaction[], dateRange: DateRangeResult) => {
    const totalRevenue = data.reduce((sum: number, item: Transaction) => sum + (item.amount || 0), 0);
    const totalCount = data.length;

    setMetrics({
      revenue: totalRevenue,
      count: totalCount,
      period: dateRange.label,
      dateRange: dateRange.dateRange
    });
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDateOnly = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getSourceBadge = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    if (methodLower.includes('upi')) return 'UPI';
    if (methodLower.includes('card')) return 'Card';
    if (methodLower.includes('netbanking')) return 'Net Banking';
    if (methodLower.includes('wallet')) return 'Wallet';
    if (methodLower.includes('cash')) return 'Cash';
    return 'Online';
  };

  const getSourceColor = (method: string) => {
    const methodLower = method?.toLowerCase() || '';
    if (methodLower.includes('upi')) return 'bg-blue-100 text-blue-800';
    if (methodLower.includes('card')) return 'bg-green-100 text-green-800';
    if (methodLower.includes('netbanking')) return 'bg-purple-100 text-purple-800';
    if (methodLower.includes('wallet')) return 'bg-yellow-100 text-yellow-800';
    if (methodLower.includes('cash')) return 'bg-gray-100 text-gray-800';
    return 'bg-blue-100 text-blue-800';
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    if (filter !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
    }
    setFilterMenuOpen(false);
  };

  const filterOptions: Array<{ value: FilterType; label: string }> = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
  ];

  const selectedFilterLabel =
    filterOptions.find((filter) => filter.value === selectedFilter)?.label || 'Daily';

  const renderCurrencyValue = (value: string) => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-gray-600">Loading revenue data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-4 font-tori-garamond sm:px-2 sm:py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col text-left md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-tori-garamond text-4xl font-light leading-[0.95] text-white sm:text-5xl lg:text-6xl 2xl:text-7xl">{config.displayName}</h1>
          <p className="font-tori-garamond mt-2 text-lg font-light leading-tight text-blue-100/34 sm:text-xl">Track booking revenue and venue performance for {tenant?.name || 'your sports venue'}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Date Filter Controls */}
      <div className="mb-6 flex justify-start lg:justify-end">
        <div className="flex w-full flex-col gap-3 sm:max-w-xs lg:w-auto lg:max-w-none lg:flex-row lg:items-center">
          <div className="relative z-50">
            <button
              type="button"
              onClick={() => setFilterMenuOpen((open) => !open)}
              className="tori-unstyled-button flex h-11 w-full min-w-[9rem] items-center justify-between rounded-full border border-white/10 bg-white/[0.075] py-2 pl-5 pr-4 font-tori-garamond text-xl font-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-white/[0.1] lg:w-auto"
            >
              <span>{selectedFilterLabel}</span>
              <svg className={`ml-4 h-4 w-4 text-blue-100/75 transition ${filterMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 6 8 10l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {filterMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[90] w-40 overflow-hidden rounded-[1.1rem] border border-white/12 bg-[#071421]/95 p-1.5 font-tori-garamond shadow-[0_22px_58px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => handleFilterChange(filter.value)}
                    className={`tori-unstyled-button flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left font-tori-garamond text-lg font-light transition ${
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
          </div>
          <button 
            onClick={() => fetchRevenueData()}
            className="tori-unstyled-button group inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.075] py-2 pl-2 pr-4 font-tori-garamond text-lg font-light text-white transition hover:bg-white/[0.11]"
          >
            <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3efe8] text-[#111827]">
              <svg className="h-4 w-4 transition duration-700 group-hover:rotate-[360deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
            Refresh
          </button>
          
          {/* Custom Date Range Inputs */}
          {selectedFilter === 'custom' && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div>
                <label className="mb-1 block text-xl font-light text-blue-100/60">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-sm text-white focus:border-[#9ed3ff]/45 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xl font-light text-blue-100/60">End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  min={customDateRange.startDate}
                  className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-sm text-white focus:border-[#9ed3ff]/45 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Metrics Cards */}
      <div className="mx-auto mb-8 grid w-full max-w-[72rem] grid-cols-1 gap-3 md:grid-cols-3">
        {/* Total Revenue for Selected Period */}
        <div className="relative flex min-h-[9.5rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-[#dbeafe]/95 to-[#9ec7ff]/80 p-4 pb-0 text-[#07111f] shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:min-h-[11.6rem]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.22),transparent_12rem)] opacity-70" />
          <div className="relative flex min-h-full w-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
              <p className="text-left text-xl font-light normal-case opacity-72">Total Revenue</p>
              </div>
              <span className="ml-auto rounded-full border border-white/14 bg-white/12 px-3 py-1 font-tori-garamond text-xs font-light leading-none normal-case opacity-75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                {metrics.period}
              </span>
            </div>
            <p className="absolute -bottom-2 left-0 text-left text-6xl font-light leading-[0.78] sm:-bottom-3 sm:text-8xl">
              {renderCurrencyValue(formatCurrency(metrics.revenue))}
            </p>
          </div>
        </div>

        {/* Average per appointment/booking */}
        <div className="relative flex min-h-[9.5rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-[#111827]/95 to-[#17233a]/90 p-4 pb-0 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:min-h-[11.6rem]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.22),transparent_12rem)] opacity-70" />
          <div className="relative flex min-h-full w-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <p className="max-w-[70%] text-left text-xl font-light normal-case text-blue-100/72">Average per {config.entityName}</p>
              <span className="ml-auto rounded-full border border-white/14 bg-white/12 px-3 py-1 font-tori-garamond text-xs font-light leading-none normal-case text-blue-100/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                {metrics.period}
              </span>
            </div>
            <p className="absolute -bottom-2 left-0 text-left text-6xl font-light leading-[0.78] sm:-bottom-3 sm:text-8xl">
              {renderCurrencyValue(
                metrics.count > 0 
                  ? formatCurrency(Math.round(metrics.revenue / metrics.count))
                  : formatCurrency(0)
              )}
            </p>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="relative flex min-h-[9.5rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-[#0c141f]/95 to-[#142033]/90 p-4 pb-0 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:min-h-[11.6rem]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.22),transparent_12rem)] opacity-70" />
          <div className="relative flex min-h-full w-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <p className="max-w-[70%] text-left text-xl font-light normal-case text-blue-100/72">Total Transactions</p>
              <span className="ml-auto rounded-full border border-white/14 bg-white/12 px-3 py-1 font-tori-garamond text-xs font-light leading-none normal-case text-blue-100/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                {metrics.period}
              </span>
            </div>
            <p className="absolute -bottom-2 left-0 text-left text-6xl font-light leading-[0.78] sm:-bottom-3 sm:text-8xl">
              {metrics.count}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#030812]/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-tori-garamond text-2xl font-light text-white">
                Transactions - {metrics.period}
              </h2>
              <p className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-tori-garamond text-sm font-light text-blue-100/58">
                {metrics.dateRange}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-left sm:text-right">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-tori-garamond text-sm font-light text-blue-100/58">
                Showing all {transactions.length} transactions
              </span>
              <div className="font-tori-garamond text-xl font-light text-white">
                {formatCurrency(metrics.revenue)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-[56rem] divide-y divide-white/8 xl:min-w-full">
            <thead className="bg-white/[0.035]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left font-tori-garamond text-base font-light normal-case text-blue-100/45">
                  Booking Date
                </th>
                <th scope="col" className="px-6 py-3 text-left font-tori-garamond text-base font-light normal-case text-blue-100/45">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left font-tori-garamond text-base font-light normal-case text-blue-100/45">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left font-tori-garamond text-base font-light normal-case text-blue-100/45">
                  Payment Method
                </th>
                <th scope="col" className="px-6 py-3 text-right font-tori-garamond text-base font-light normal-case text-blue-100/45">
                  amount
                </th>
                <th scope="col" className="px-6 py-3 text-center font-tori-garamond text-base font-light normal-case text-blue-100/45">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 bg-transparent">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto text-7xl leading-none">
                        🧾
                      </div>
                      <p className="font-tori-garamond mt-5 text-4xl font-light leading-none text-white">No transactions found</p>
                      <p className="mx-auto mt-2 max-w-sm font-tori-garamond text-base text-blue-100/50">No revenue data is available for this period yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateOnly(transaction.booking_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getFieldValue(transaction, 'name')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getFieldValue(transaction, 'contact')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {config.serviceLabel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(transaction.payment_method)}`}>
                        {getSourceBadge(transaction.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {transaction.booking_reference || transaction.id.slice(0, 8)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRevenuePage;