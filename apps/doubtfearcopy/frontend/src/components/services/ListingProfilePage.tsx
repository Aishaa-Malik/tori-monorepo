import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageCarousel from './ImageCarousel';
import {
  buildListingDescription,
  buildListingFacilities,
  fetchPublicListingById,
  formatOperatingHours,
  formatPricing,
  getListingImage,
} from '../../services/publicListings';


export type Profile = {
  name: string;
  images: string[];
  description: string;
  facilities: string[];
  hours: string;
  pricing: string;
  contact: { phone?: string; email?: string; address?: string };
  rating?: number;
  reviewCount?: number;
  mapUrl?: string;
  qrCode?: string;
  bookingLink?: string;
};

const ListingProfilePage: React.FC = () => {
  const { category, subcategory, id } = useParams<{
    category: string;
    subcategory: string;
    id: string;
  }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      setProfile(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const listing = await fetchPublicListingById(id);

        if (!isMounted) return;

        const image = getListingImage(listing.subcategoryTag);
        const mappedProfile: Profile = {
          name: listing.businessName,
          images: [image],
          description: buildListingDescription(listing),
          facilities: buildListingFacilities(listing),
          hours: formatOperatingHours(listing.weeklySlots, listing.operatingDays),
          pricing: formatPricing(listing.price, listing.durationMins),
          contact: {
            email: listing.email || undefined,
            address: listing.location || undefined,
          },
          rating: typeof listing.rating === 'number' ? listing.rating : undefined,
          reviewCount: typeof listing.reviewCount === 'number' ? listing.reviewCount : undefined,
          mapUrl: listing.googleMapsLink || undefined,
        };

        setProfile(mappedProfile);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load profile right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-lg bg-white border border-red-200 p-6">
            <p className="text-red-700">{loadError}</p>
            <div className="mt-4 flex gap-4">
              <Link to={subcategory ? `/services/${category}/${subcategory}` : `/services/${category || ''}`} className="text-teal-600">Back to listings</Link>
              <Link to="/services" className="text-teal-600">All services</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-lg bg-white border border-gray-200 p-6">
            <p className="text-gray-700">Profile not found or not yet available.</p>
            <div className="mt-4 flex gap-4">
              <Link to={subcategory ? `/services/${category}/${subcategory}` : `/services/${category || ''}`} className="text-teal-600">Back to listings</Link>
              <Link to="/services" className="text-teal-600">All services</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
        {typeof profile.rating === 'number' && (
          <p className="mt-2 text-lg text-gray-800">{profile.rating.toFixed(1)} ★ ({profile.reviewCount})</p>
        )}
        <div className="mt-6">
          <ImageCarousel images={profile.images} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-2 text-gray-700">{profile.description}</p>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Facilities</h2>
              <ul className="mt-2 list-disc list-inside text-gray-700">
                {profile.facilities.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Operating Hours</h2>
              <p className="mt-2 text-gray-700">{profile.hours}</p>
            </section>
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Pricing</h2>
              <p className="mt-2 text-gray-700">{profile.pricing}</p>
            </section>
          </div>
          <aside className="space-y-6">
            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Contact</h2>
              <div className="mt-2 text-gray-700 space-y-1">
                {profile.contact.phone && <p>Phone: {profile.contact.phone}</p>}
                {profile.contact.email && <p>Email: {profile.contact.email}</p>}
                {profile.contact.address && <p>Address: {profile.contact.address}</p>}
                {profile.mapUrl && (
                  <p>
                    <a href={profile.mapUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600">View on Google Maps</a>
                  </p>
                )}
              </div>
              <div className="mt-4">
                {(profile.bookingLink || profile.mapUrl) && (
                  <a
                    href={profile.bookingLink || profile.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-md bg-yellow-300 px-6 py-4 text-gray-900 font-medium hover:bg-yellow-300 transition-colors"
                  >
                    {profile.bookingLink ? 'Book Now' : 'View on Google Maps'}
                  </a>
                )}
              </div>
              {profile.qrCode && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Scan to Book/Pay</p>
                  <img
                    src={profile.qrCode}
                    alt="QR Code"
                    className="w-full max-w-[700px] h-auto rounded-md border border-gray-200"
                  />
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ListingProfilePage;
