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
  const isDoctor = ['doctor'].includes(userRoleString);
  const isTurfUser = ['turf'].includes(userRoleString);

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

        await fetch('https://aishaaaaaa1503.app.n8n.cloud/webhook/create-google-cal-event', {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Appointment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              {isDoctor ? 'Patient Name *' : 'Customer Name *'}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              {isDoctor ? 'Patient Email *' : 'Customer Email *'}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              {isDoctor ? 'Patient Contact' : 'Customer Contact'}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {isDoctor && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="doctor">
                Doctor Name *
              </label>
              <input
                id="doctor"
                name="doctor"
                type="text"
                value={formData.doctor}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                Time *
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentId">
              Payment ID
            </label>
            <input
              id="paymentId"
              name="paymentId"
              type="text"
              value={formData.paymentId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
                Payment Method
              </label>
              <input
                id="paymentMethod"
                name="paymentMethod"
                type="text"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="flex items-center justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentForm;
