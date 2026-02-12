import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ListingCard, { Listing } from './ListingCard';

const subcategoryListings: Record<string, Record<string, Listing[]>> = {
  'sports-venues': {
    'cricket-pitch': [
      { id: 'cp-1', name: 'Tiento Sports', location: 'Mission Road · 1.1 km', thumb: '/tiento.png', details: 'Bookable' },
      { id: 'cp-2', name: 'Fusion – The Turf', location: 'Next to KSH · 1.1 km', thumb: '/c2.png', details: 'Bookable' },
      { id: 'cp-3', name: 'Karnataka Sharks Cricket', location: 'BCVL · 1.4 km', thumb: '/c3.png', details: 'Bookable' },
      { id: 'cp-4', name: 'Basecamp by Push Sports – Bengaluru', location: 'Palace Road · 1.4 km', thumb: '/c4.png', details: 'Bookable' },
      { id: 'cp-5', name: 'Basecamp Football by Rush Arena', location: 'Bengaluru City Univ · 1.5 km', thumb: '/c5.png', details: 'Bookable' },
    ],
    'football-turf': [
      { id: 'ft-1', name: 'Bangalore Football Turf', location: 'Hennur Ring · Royal Towers', thumb: '/f1.png', details: 'Soccer field' },
      { id: 'ft-2', name: 'Bangalore Turf Club Ltd.', location: 'Race Course Rd', thumb: '/f2.png', details: 'Racecourse' },
      { id: 'ft-3', name: 'Turf City Sports', location: 'BBL Layout Main Rd', thumb: '/f3.png', details: 'Sports complex' },
    ],
    pickleball: [
      { id: 'pb-1', name: 'PicknPadel Arena – Padel & Pickleball', location: 'Begur', thumb: '/p1.png', details: 'Sports complex' },
      { id: 'pb-2', name: 'PowerPickle', location: 'Vistar Resorts & Hotels', thumb: '/p2.png', details: 'Pickleball court' },
      { id: 'pb-3', name: 'Go Picklers', location: '2nd Main Rd', thumb: '/p3.png', details: 'Pickleball court' },
    ],
  },
};

const SubcategoryListingsPage: React.FC = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory: string }>();
  const listings = category && subcategory ? subcategoryListings[category]?.[subcategory] : undefined;
  const title = `${subcategory?.replace('-', ' ') || 'Subcategory'}`;

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold capitalize">{title}</h1>
          <div className="flex gap-4">
            <Link to={`/services/${category}`} className="text-sm text-teal-600 hover:text-teal-700">Back to {category}</Link>
            <Link to="/services" className="text-sm text-teal-600 hover:text-teal-700">All services</Link>
          </div>
        </div>
        {!listings || listings.length === 0 ? (
          <div className="mt-8 rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">No listings available yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} categorySlug={category!} subcategorySlug={subcategory!} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryListingsPage;