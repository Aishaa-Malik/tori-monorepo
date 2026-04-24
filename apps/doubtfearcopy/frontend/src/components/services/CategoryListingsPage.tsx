import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ListingCard from './ListingCard';
import ServiceCategoryCard, { ServiceCategory } from './ServiceCategoryCard';
import { servicesData, subcategoriesMap, readableNames } from '../../data/services';


const CategoryListingsPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  // const listings = category ? sampleListings[category] : undefined;
    const subcategories = category ? subcategoriesMap[category] : undefined;

      // only used for categories with no subcategory picker (flat listing)
  // flatten all subcategory arrays into one list
  const listings =
    !subcategories && category && servicesData[category]
      ? Object.values(servicesData[category]).flat()
      : undefined;

  const title = category && readableNames[category] ? readableNames[category] : category || 'Category';

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="relative flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          
          {category === 'events' && (
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
              <Link 
                to="/events/create" 
                className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
              >
                Create and host an event
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            {category === 'events' && (
              <Link 
                to="/events/create" 
                className="md:hidden bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                Create Event
              </Link>
            )}
            <Link to="/services" className="text-sm text-teal-600 hover:text-teal-700 font-medium">Back to all services</Link>
          </div>
        </div>
        {subcategories ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((s) => (
              <ServiceCategoryCard
                key={s.id}
                category={{ ...s, slug: `${category}/${s.id}` }}
              />
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
