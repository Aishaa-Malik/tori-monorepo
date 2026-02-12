import React from 'react';
import { Link } from 'react-router-dom';

export type Listing = {
  id: string;
  name: string;
  location: string;
  thumb: string;
  details: string;
};

type Props = {
  listing: Listing;
  categorySlug: string;
  subcategorySlug?: string;
};

const ListingCard: React.FC<Props> = ({ listing, categorySlug, subcategorySlug }) => {
  return (
    <Link
      to={`/services/${categorySlug}${subcategorySlug ? `/${subcategorySlug}` : ''}/${listing.id}`}
      className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition"
    >
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={listing.thumb}
          alt={listing.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{listing.name}</h3>
        <p className="text-sm text-gray-600">{listing.location}</p>
        <p className="mt-2 text-sm text-gray-700">{listing.details}</p>
      </div>
    </Link>
  );
};

export default ListingCard;