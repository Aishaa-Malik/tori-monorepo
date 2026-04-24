import React from 'react';
import ServiceCategoryCard, { ServiceCategory } from './ServiceCategoryCard';

const categories: ServiceCategory[] = [
  
  { id: 'fitness-venues', name: 'FUN WORKOUT', slug: 'fitness-venues', description: 'Fitness centers and personal training.', image: '/images/parkyoga.png' },
  { id: 'sports-venues', name: 'Sports Venues', slug: 'sports-venues', description: 'Football turfs, courts, and arenas.', image: '/images/f1.png'  },
   { id: 'events', name: 'Events', slug: 'events', description: 'Local events and experiences.', image: '/images/run-1.png' },
  { id: 'doctors', name: 'Doctors', slug: 'doctors', description: 'Consultations and clinics nearby.', image: '/images/doctor.png' },
  // { id: 'healthcare', name: 'Healthcare Centres', slug: 'healthcare-centres', description: 'Labs and diagnostic centers.', image: '/COMINGSOON.png' },
  // { id: 'physiotherapy', name: 'Physiotherapy', slug: 'physiotherapy', description: 'Sessions and home visits.', image: '/COMINGSOON.png' },
  // { id: 'mental-health', name: 'Mental Health', slug: 'mental-health', description: 'Therapy and counseling.', image: '/COMINGSOON.png' },
  { id: 'salons', name: 'Salons', slug: 'salons', description: 'Hair and beauty services.', image: '/images/COMINGSOON.png' },
  //{ id: 'law', name: 'Law Consultancy', slug: 'law-consultancy', description: 'Legal advice and meetings.', image: '/COMINGSOON.png' },
  { id: 'restaurants', name: 'Restaurants', slug: 'restaurants', description: 'Table reservations.', image: '/images/COMINGSOON.png' },
  { id: 'spas', name: 'Spas', slug: 'spas', description: 'Spa and wellness treatments.', image: '/images/COMINGSOON.png' },
 
];

const ServicesDirectoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">All Services</h1>
        </div>
        <p className="mt-2 text-gray-600">Browse by category to find services near you.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <ServiceCategoryCard key={c.id} category={c} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesDirectoryPage;