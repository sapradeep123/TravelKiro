import { Location } from '@/types';
import Image from 'next/image';

interface LocationCardProps {
  location: Location;
  onClick?: () => void;
}

export default function LocationCard({ location, onClick }: LocationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-success text-white';
      case 'PENDING':
        return 'bg-warning text-white';
      case 'REJECTED':
        return 'bg-error text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div
      onClick={onClick}
      className="card group cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-surface overflow-hidden">
        {location.images && location.images[0] ? (
          <img
            src={location.images[0]}
            alt={location.area}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
            <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(location.approvalStatus)}`}>
            {location.approvalStatus}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
          {location.area}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-secondary mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{location.state}, {location.country}</span>
        </div>

        <p className="text-sm text-secondary line-clamp-2 mb-4">
          {location.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-xs text-secondary">
            {new Date(location.createdAt).toLocaleDateString()}
          </div>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
