import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [locationUrl, setLocationUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEventId, setSuccessEventId] = useState<string | null>(null);

  // Function to transform a standard Google Maps URL into an Embeddable one
  const getEmbedUrl = (inputUrl: string) => {
    if (!inputUrl) return null;
    if (inputUrl.includes('embed')) return inputUrl;
    const baseUrl = 'https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY';
    // Using a placeholder API key or passing directly if possible
    // Note: For real production, a valid Google Maps API Key is required.
    return `${baseUrl}&q=${encodeURIComponent(inputUrl)}`;
  };

  const generateLumaStyleId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'evt-';
    for (let i = 0; i < 15; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to create an event.');
      return;
    }

    if (!title || !startTime || !description || !capacity || !locationUrl) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const generatedId = generateLumaStyleId();

    try {
      // In Supabase, the table is named 'events'
      const { data, error: insertError } = await supabase
        .from('events')
        .insert([
          {
            // You might need to adjust your database schema if you want to store this specific ID format
            // If ID is a strict UUID, you might need to store this in a 'slug' or 'share_id' column instead.
            // For now, assuming you can store it in a 'slug' column or similar.
            // id: generatedId, (if supported by schema)
            title,
            description,
            start_time: new Date(startTime).toISOString(),
            location_url: locationUrl,
            capacity: Number(capacity),
            host_id: user.id,
            status: 'open'
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // If schema uses UUID for ID, we use our generated string for sharing,
      // but keep the real ID if needed. We'll use the generated string for the UI.
      setSuccessEventId(generatedId);
      
      // Update URL to match Luma style
      window.history.pushState({}, '', `/events/manage/${generatedId}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (!successEventId) return;
    
    // The WhatsApp Deep Link
    // Replace YOUR_BOT_NUMBER with actual bot number if available, else a placeholder
    const botNumber = '1234567890'; 
    const shareText = `JoinEvent_${successEventId}`;
    const whatsappUrl = `https://wa.me/${botNumber}?text=${encodeURIComponent(shareText)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (successEventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Event Created!</h2>
          <p className="text-gray-600 mb-8">
            Your event "{title}" has been successfully created. Share the link below to invite guests via WhatsApp.
            <br/>
            <span className="text-xs font-mono bg-gray-100 p-1 rounded text-gray-500 mt-2 block break-all">
              {window.location.origin}/events/manage/{successEventId}
            </span>
          </p>
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-green-500 hover:bg-green-600 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.459-1.655-1.756-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Share via WhatsApp
          </button>
          
          <button
            onClick={() => {
              setSuccessEventId(null);
              setTitle('');
              setDescription('');
              setStartTime('');
              setEndTime('');
              setCapacity('');
              setLocationUrl('');
              window.history.pushState({}, '', '/events/create');
            }}
            className="mt-4 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Create Another Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#24231f] text-gray-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Side: Image Placeholder */}
        <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col gap-4">
          <div className="aspect-square bg-yellow-400 rounded-3xl w-full flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
            {/* Decorative pattern for the image placeholder */}
            <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cpath d=\\"M54.627 0l.83.83-54.627 54.627-.83-.83L54.627 0zM29.627 0l.83.83-29.627 29.627-.83-.83L29.627 0zM59.627 25l.83.83-34.627 34.627-.83-.83L59.627 25z\\" fill=\\"%23000000\\" fill-opacity=\\"0.1\\" fill-rule=\\"evenodd\\"/%3E%3C/svg%3E")' }}></div>
            <span className="text-black font-bold text-xl relative z-10 opacity-50">Event Cover</span>
            <button className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow hover:bg-white text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </button>
          </div>
          <div className="bg-[#302e29] p-3 rounded-xl flex items-center justify-between border border-white/5 cursor-pointer hover:bg-[#383530] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-gray-200 rounded"></div>
              <div className="text-sm">
                <div className="text-gray-400 text-xs">Theme</div>
                <div className="text-white">Minimal</div>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
          </div>
        </div>

        {/* Right Side: Form */}
        <form onSubmit={handleCreate} className="w-full md:w-2/3 space-y-6">
          
          <div className="flex items-center gap-3 mb-6">
            <button type="button" className="bg-[#302e29] px-3 py-1.5 rounded-full text-xs font-medium text-purple-400 border border-white/5 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
              Personal Calendar <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button type="button" className="ml-auto bg-[#302e29] px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 border border-white/5 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              Public <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Event Name */}
          <div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event Name"
              className="w-full bg-transparent text-4xl md:text-5xl font-serif font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-0 border-none px-0 mb-2"
              required
            />
          </div>

          {/* Time Card */}
          <div className="flex gap-4">
            <div className="flex-1 bg-[#302e29] rounded-2xl p-4 border border-white/5 flex flex-col justify-center relative">
              <div className="absolute left-4 top-6 bottom-6 w-px bg-gray-600 flex flex-col justify-between items-center">
                <div className="w-2 h-2 rounded-full bg-gray-400 -ml-[3.5px]"></div>
                <div className="w-2 h-2 rounded-full border border-gray-400 bg-transparent -ml-[3.5px]"></div>
              </div>
              
              <div className="flex items-center justify-between ml-6 mb-4">
                <span className="text-gray-400 text-sm">Start</span>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none focus:ring-0 border-none text-right cursor-pointer"
                  required
                />
              </div>
              <div className="flex items-center justify-between ml-6">
                <span className="text-gray-400 text-sm">End</span>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none focus:ring-0 border-none text-right cursor-pointer"
                />
              </div>
            </div>
            <div className="w-1/3 bg-[#302e29] rounded-2xl p-4 border border-white/5 flex flex-col justify-center items-start cursor-pointer hover:bg-[#383530] transition-colors">
              <svg className="w-4 h-4 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              <div className="text-sm text-white font-medium">GMT+05:30</div>
              <div className="text-xs text-gray-400">Calcutta</div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-[#302e29] rounded-2xl p-4 border border-white/5 transition-colors focus-within:ring-1 focus-within:ring-white/20">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <div className="flex-1">
                <input
                  type="url"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="Add Event Location"
                  className="w-full bg-transparent text-white placeholder-white font-medium focus:outline-none focus:ring-0 border-none px-0"
                  required
                />
                <div className="text-xs text-gray-400">Offline location or virtual link</div>
              </div>
            </div>
            {locationUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-sm bg-black/20">
                <iframe
                  width="100%"
                  height="150"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={getEmbedUrl(locationUrl) || ''}
                  allowFullScreen
                  title="Location Preview"
                ></iframe>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#302e29] rounded-2xl p-4 border border-white/5 focus-within:ring-1 focus-within:ring-white/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add Description"
                className="w-full bg-transparent text-white placeholder-white font-medium focus:outline-none focus:ring-0 border-none px-0 resize-none"
                required
              ></textarea>
            </div>
          </div>

          {/* Event Options */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 px-1">Event Options</h3>
            <div className="bg-[#302e29] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                  <span className="text-sm">Ticket Price</span>
                </div>
                <div className="text-sm text-white flex items-center gap-2 cursor-pointer hover:text-gray-300">
                  Free <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <span className="text-sm">Require Approval</span>
                </div>
                <div className="w-10 h-6 bg-gray-600 rounded-full flex items-center px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  <span className="text-sm">Capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Unlimited"
                    className="bg-transparent text-right text-sm text-white placeholder-white focus:outline-none border-none p-0 w-20"
                  />
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl shadow-sm text-lg font-bold text-black bg-white hover:bg-gray-100 focus:outline-none transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;