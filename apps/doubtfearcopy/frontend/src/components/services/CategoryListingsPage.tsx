import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ListingCard, { Listing } from './ListingCard';
import ServiceCategoryCard, { ServiceCategory } from './ServiceCategoryCard';
import { sampleProfiles } from './ListingProfilePage';


const doctorsListings: Listing[] = [
  { id: 'city-clinic', name: 'City Clinic', location: 'MG Road', thumb: 'https://via.placeholder.com/1200x675?text=City+Clinic', details: 'General physician' },
  { id: 'care-hospital', name: 'Care Hospital', location: 'Indiranagar', thumb: 'https://via.placeholder.com/1200x675?text=Care+Hospital', details: 'Specialists and OPD' },
];

const gymSubcategorySlug = Object.keys(sampleProfiles.gyms || {})[0];
const gymsListings: Listing[] = gymSubcategorySlug
  ? Object.entries(sampleProfiles.gyms?.[gymSubcategorySlug] || {}).map(([id, profile]) => ({
      id,
      name: profile.name,
      location: profile.contact.address || 'Nearby',
      thumb: profile.images[0] || '/images/COMINGSOON.png',
      details: profile.description,
    }))
  : [];

const sportsSubcategories: ServiceCategory[] = [
  { id: 'cricket-pitch', name: 'Cricket Pitch', slug: 'sports-venues/cricket-pitch', description: 'Nets and turf wickets', image: '/images/c5.png' },
  { id: 'football-turf', name: 'Football Turf', slug: 'sports-venues/football-turf', description: '5-a-side / 7-a-side', image: '/images/f3.png' },
  { id: 'pickleball', name: 'Pickleball', slug: 'sports-venues/pickleball', description: 'Courts and coaching', image: '/images/p3.png' },
];

const fitnessSubcategories: ServiceCategory[] = [
  { id: 'gym', name: 'Gym', slug: 'fitness/gym', description: 'Strength and conditioning', image: '/images/gym.png' },
  { id: 'yoga', name: 'Yoga', slug: 'fitness/yoga', description: 'Flexibility, balance, mindfulness', image: '/images/yoga.png' },
  { id: 'zumba', name: 'Zumba', slug: 'fitness/zumba', description: 'Dance-based cardio workouts', image: '/images/zumba.png' },
  { id: 'nature-workout', name: 'Nature Workout', slug: 'fitness/nature-workout', description: 'Outdoor functional training', image: '/images/nature-workout.png' },
  { id: 'nature-fitness-dance-party', name: 'Nature Fitness Dance Party', slug: 'fitness/nature-fitness-dance-party', description: 'Outdoor dance + fitness experience', image: '/images/nature-dance.png' },
  { id: 'meditation', name: 'Meditation', slug: 'fitness/meditation', description: 'Mind relaxation and focus', image: '/images/meditation.png' },
  { id: 'nature-meditation', name: 'Nature Meditation', slug: 'fitness/nature-meditation', description: 'Guided sessions in natural settings', image: '/images/nature-meditation.png' },
];

const readableNames: Record<string, string> = {
  'sports-venues': 'Sports Venues',
  'healthcare-centres': 'Healthcare Centres',
  doctors: 'Doctors',
  gyms: 'Gyms',
};

// define once, outside the component
const subcategoryMap: Record<string, ServiceCategory[]> = {
  'sports-venues': sportsSubcategories,
  'gyms': fitnessSubcategories,
};


const CategoryListingsPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const listings =
    category === 'gyms'
      ? gymsListings
      : category === 'doctors'
      ? doctorsListings
      : undefined;
  const title = category && readableNames[category] ? readableNames[category] : category || 'Category';
  const subcategories = category ? subcategoryMap[category] : undefined;

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          <Link to="/services" className="text-sm text-teal-600 hover:text-teal-700">Back to all services</Link>
        </div>
       {subcategories ? (
  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {subcategories.map((s) => <ServiceCategoryCard key={s.id} category={s} />)}
  </div>
) : !listings || listings.length === 0 ? (
  <div className="mt-8 rounded-lg bg-white border border-gray-200 p-6">
    <p className="text-gray-700">No listings available yet.</p>
  </div>
) : (
  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {listings.map((l) => <ListingCard key={l.id} listing={l} categorySlug={category!} />)}
  </div>
)}
      </div>
    </div>
  );
};

export default CategoryListingsPage;
