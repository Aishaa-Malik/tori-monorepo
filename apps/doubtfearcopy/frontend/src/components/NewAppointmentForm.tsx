import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

interface FormValues {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  paymentId?: string;
  amount?: string;
  paymentMethod?: string;
  doctor?: string;
}

interface NewAppointmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onRefresh?: () => void;
}

const NewAppointmentForm: React.FC<NewAppointmentFormProps> = ({ onClose, onSuccess, onRefresh }) => {
  const { tenant, user } = useAuth();
  const tenantId = tenant?.id || user?.tenantId;

  const [formData, setFormData] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    paymentId: '',
    amount: '',
    paymentMethod: '',
    doctor: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe role checking that works with any UserRole type
  const userRoleString = (user?.role ?? '').toString().toLowerCase();
  const businessType = (user?.businessType ?? '').toString().toLowerCase();
  const isDoctor = businessType.includes('doctor') || businessType.includes('health');
  const isTurfUser = !isDoctor || ['turf'].includes(userRoleString);
  const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-blue-100/58';
  const inputClass =
    'w-full rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition placeholder:text-blue-100/30 focus:border-blue-200/35 focus:bg-white/[0.1]';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatToPgTime = (hhmm: string) => {
    const [h, m] = hhmm.split(':');
    const today = new Date().toISOString().split('T')[0];
    const local = new Date(`${today}T${h}:${m}:00+05:30`);
    return local.toLocaleTimeString('en-IN', 
      { timeZone:'Asia/Kolkata', hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!tenant?.id && !user?.tenantId) {
        throw new Error('Tenant information is missing');
      }

      const tenant_id = tenant?.id || user?.tenantId;
      const dateStr = formData.date;
      const timeStr = formData.time;

      // Determine which table to use based on user type
      const tableName = isTurfUser ? 'appointments' : 'appointments';
      
      // Assemble the row based on user type
      let row: any;
      
      if (isTurfUser) {
        row = {
          tenant_id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_contact: formData.phone || null,
          booking_date: dateStr,
          start_time: formatToPgTime(timeStr),
          booking_reference: `booking_${Date.now()}`,
          payment_id: formData.paymentId || null,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          currency: "INR",
          payment_method: formData.paymentMethod || null,
          status: 'Scheduled'
        };
      } else {
        // Doctor appointment format
        row = {
          tenant_id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_contact: formData.phone || null,
          doctor: formData.doctor || 'Default Doctor',
          booking_date: dateStr,
          start_time: formatToPgTime(timeStr),
          booking_reference: `booking_${Date.now()}`,
          payment_id: formData.paymentId || null,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          currency: "INR",
          payment_method: formData.paymentMethod || null,
          status: 'Scheduled'
        };
      }

      // Insert into appropriate table
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(row);

      if (insertError) {
           console.log(`Error inserting into ${tableName}:`, insertError);
           throw insertError;
      }

      // Optional: Trigger webhook for Google Calendar event creation
      try {
         const startDateTime = `${dateStr}T${timeStr}:00.000+05:30`;

        await fetch('https://aishaaaaaaaaaaaaa.app.n8n.cloud/webhook/create-google-cal-event', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            tenant_id, 
            startDateTime,
            summary: isTurfUser ? row.customer_name : row.customer_name 
          })
        });
      } catch (webhookError) {
        console.error('Failed to create calendar event:', webhookError);
      }

      // Call the refresh trigger before success callbacks
      if (onRefresh) {
        onRefresh();
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02060d]/72 p-4 backdrop-blur-xl">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-white/16 bg-[linear-gradient(145deg,rgba(25,39,61,0.86),rgba(5,10,18,0.94))] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.14)]">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_0%,rgba(220,238,255,0.18),transparent_18rem),linear-gradient(120deg,rgba(255,255,255,0.08),transparent_34%,rgba(255,255,255,0.035))]" />
        <div className="relative flex justify-between items-start mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100/45">Manual booking</p>
            <h2 className="font-tori-garamond text-4xl font-light leading-none">Add venue slot</h2>
          </div>
          <button 
            onClick={onClose}
            className="tori-unstyled-button flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-blue-100/65 transition hover:bg-white/12 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="relative mb-4 rounded-2xl border border-red-300/20 bg-red-500/12 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-4">
            <label className={labelClass} htmlFor="name">
              {isDoctor ? 'Patient Name *' : 'Customer Name *'}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass} htmlFor="email">
              {isDoctor ? 'Patient Email *' : 'Customer Email *'}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="mb-4">
            <label className={labelClass} htmlFor="phone">
              {isDoctor ? 'Patient Contact' : 'Customer Contact'}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {isDoctor && (
            <div className="mb-4">
              <label className={labelClass} htmlFor="doctor">
                Doctor Name *
              </label>
              <input
                id="doctor"
                name="doctor"
                type="text"
                value={formData.doctor}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="date">
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="time">
                Time *
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelClass} htmlFor="paymentId">
              Payment ID
            </label>
            <input
              id="paymentId"
              name="paymentId"
              type="text"
              value={formData.paymentId}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="paymentMethod">
                Payment Method
              </label>
              <input
                id="paymentMethod"
                name="paymentMethod"
                type="text"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="tori-btn-secondary tori-btn-compact"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tori-btn-primary tori-btn-compact"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentForm;
