import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ListingCard from './ListingCard';
import ServiceCategoryCard, { ServiceCategory } from './ServiceCategoryCard';
import { servicesData, subcategoriesMap, readableNames } from '../../data/services';


const CategoryListingsPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [showPricing, setShowPricing] = useState(false);
  const navigate = useNavigate();

  // const listings = category ? sampleListings[category] : undefined;
  const subcategories = category ? subcategoriesMap[category] : undefined;

      // only used for categories with no subcategory picker (flat listing)
  // flatten all subcategory arrays into one list
  const listings =
    !subcategories && category && servicesData[category]
      ? Object.values(servicesData[category]).flat()
      : undefined;

  const title = category && readableNames[category] ? readableNames[category] : category || 'Category';

  const handleSubscribe = (price: number, planName: string) => {
    navigate('/payment', {
      state: {
        amount: price,
        plan: planName
      }
    });
  };

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
          <div className="mt-8 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} categorySlug={category!} />
              ))}

              {!showPricing && listings.length > 0 && (
                <>
                  <div className="blur-md pointer-events-none opacity-50 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 z-10" />
                    <ListingCard listing={listings[0]} categorySlug={category!} />
                  </div>
                  <div className="blur-md pointer-events-none opacity-50 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 z-10" />
                    <ListingCard listing={listings[1 % listings.length]} categorySlug={category!} />
                  </div>
                  <div className="blur-md pointer-events-none opacity-50 relative hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 z-10" />
                    <ListingCard listing={listings[2 % listings.length]} categorySlug={category!} />
                  </div>
                </>
              )}
            </div>

            {!showPricing && (
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-12 pt-32 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent">
                <p className="text-gray-600 mb-4 font-medium text-center px-4 max-w-lg">
                  Subscribe now to access 2000+ premium venues, clinics, events and fitness centres
                </p>
                <button 
                  onClick={() => setShowPricing(true)} 
                  className="bg-red-500 text-white px-8 py-3 rounded-full font-bold hover:bg-red-600 transition shadow-lg"
                >
                  Subscribe Now
                </button>
              </div>
            )}

            {showPricing && (
              <div className="mt-12 bg-white p-8 rounded-xl shadow-2xl border border-gray-100 animate-fade-in">
                <h2 className="text-center text-xl font-bold mb-8 underline decoration-orange-400">CHOOSE YOUR PLAN</h2>
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                  
                  {/* TORI 360 */}
                  <div className="border rounded-2xl p-6 w-full max-w-sm bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-3xl font-black text-yellow-600 mb-4 italic">TORI 360</h3>
                    <ul className="space-y-3 text-sm text-gray-700 mb-6">
                      <li>• Access to 2k+ premium venues & centres</li>
                      <li>• Expert nutritionist consults & diet plans</li>
                      <li>• A.I. enabled personal fitness coaching</li>
                      <li>• Free Doctor Consultations & Pharmacy Vouchers</li>
                    </ul>
                    <div className="border-t pt-4">
                      <p className="text-2xl font-bold">₹19999 <span className="text-sm font-normal text-gray-500">/ 12 months</span></p>
                      <button onClick={() => handleSubscribe(19999, 'TORI 360 - 12 Months')} className="w-full mt-2 mb-4 bg-yellow-500 text-white py-2 rounded-full font-bold uppercase hover:bg-yellow-600 transition-colors text-sm">Subscribe Yearly</button>
                      <p className="text-xl font-bold text-orange-600 mt-2">₹4000 <span className="text-sm font-normal text-gray-500">/ month</span></p>
                      <button onClick={() => handleSubscribe(4000, 'TORI 360 - Monthly')} className="w-full mt-2 bg-red-500 text-white py-3 rounded-full font-bold uppercase hover:bg-red-600 transition-colors">Subscribe Monthly</button>
                    </div>
                  </div>

                  {/* TORI 180 */}
                  <div className="border rounded-2xl p-6 w-full max-w-sm bg-gradient-to-br from-pink-50 to-white shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-3xl font-black text-pink-500 mb-4 italic">TORI 180</h3>
                    <ul className="space-y-3 text-sm text-gray-700 mb-6">
                      <li>• Access to 2k+ premium venues & centres</li>
                      <li>• Reserve up to 5 workouts every month</li>
                      <li>• A.I. enabled personal fitness coaching</li>
                      <li>• Access to unlimited virtual classes</li>
                    </ul>
                    <div className="border-t pt-4">
                      <p className="text-2xl font-bold">₹16999 <span className="text-sm font-normal text-gray-500">/ 12 months</span></p>
                      <button onClick={() => handleSubscribe(16999, 'TORI 180 - 12 Months')} className="w-full mt-2 mb-4 bg-pink-500 text-white py-2 rounded-full font-bold uppercase hover:bg-pink-600 transition-colors text-sm">Subscribe Yearly</button>
                      <p className="text-xl font-bold text-orange-600 mt-2">₹3000 <span className="text-sm font-normal text-gray-500">/ month</span></p>
                      <button onClick={() => handleSubscribe(3000, 'TORI 180 - Monthly')} className="w-full mt-2 bg-red-500 text-white py-3 rounded-full font-bold uppercase hover:bg-red-600 transition-colors">Subscribe Monthly</button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListingsPage;
