import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ListingCard, { Listing } from './ListingCard';
import ServiceCategoryCard, { ServiceCategory } from './ServiceCategoryCard';

const sampleListings: Record<string, Listing[]> = {
  doctors: [
    { id: 'city-clinic', name: 'City Clinic', location: 'MG Road', thumb: 'https://via.placeholder.com/1200x675?text=City+Clinic', details: 'General physician' },
    { id: 'care-hospital', name: 'Care Hospital', location: 'Indiranagar', thumb: 'https://via.placeholder.com/1200x675?text=Care+Hospital', details: 'Specialists and OPD' },
  ],
};

const sportsSubcategories: ServiceCategory[] = [
  { id: 'cricket-pitch', name: 'Cricket Pitch', slug: 'sports-venues/cricket-pitch', description: 'Nets and turf wickets', image: '/c5.png' },
  { id: 'football-turf', name: 'Football Turf', slug: 'sports-venues/football-turf', description: '5-a-side / 7-a-side', image: '/f3.png' },
  { id: 'pickleball', name: 'Pickleball', slug: 'sports-venues/pickleball', description: 'Courts and coaching', image: '/p3.png' },
];

const readableNames: Record<string, string> = {
  'sports-venues': 'Sports Venues',
  'healthcare-centres': 'Healthcare Centres',
  doctors: 'Doctors',
  gyms: 'Gyms',
};

const CategoryListingsPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const listings = category ? sampleListings[category] : undefined;
  const title = category && readableNames[category] ? readableNames[category] : category || 'Category';

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          <Link to="/services" className="text-sm text-teal-600 hover:text-teal-700">Back to all services</Link>
        </div>
        {category === 'sports-venues' ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsSubcategories.map((s) => (
              <ServiceCategoryCard key={s.id} category={s} />
            ))}
          </div>
        ) : !listings || listings.length === 0 ? (
          <div className="mt-8 rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">No listings available yet for this category.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} categorySlug={category!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListingsPage;