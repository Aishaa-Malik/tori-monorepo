import React from 'react';
import { Link } from 'react-router-dom';

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

type Props = {
  category: ServiceCategory;
  to?: string;
};

const ServiceCategoryCard: React.FC<Props> = ({ category, to }) => {
  return (
    <Link
      to={to ?? `/services/${category.slug}`}
      className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">{category.name}</h4>
          <span className="text-xs text-gray-500">Explore</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{category.description}</p>
      </div>
    </Link>
  );
};

export default ServiceCategoryCard;