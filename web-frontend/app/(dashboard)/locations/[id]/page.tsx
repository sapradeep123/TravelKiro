"use client";

import { useParams, useRouter } from 'next/navigation';
import { useLocation } from '@/lib/hooks/useLocations';
import Image from 'next/image';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: location, isLoading, error } = useLocation(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-96 w-full"></div>
        <div className="skeleton h-12 w-3/4"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="card bg-error/10 border-error text-center py-12">
        <p className="text-error font-medium">Location not found</p>
        <button
          onClick={() => router.push('/locations')}
          className="mt-4 btn bg-primary-500 text-white px-6 py-2 rounded-lg"
        >
          Back to Locations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Hero Image */}
      <div className="relative h-96 rounded-xl overflow-hidden bg-surface">
        {location.images && location.images[0] ? (
          <img
            src={location.images[0]}
            alt={location.area}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
            <svg className="w-32 h-32 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-4xl font-bold mb-4">{location.area}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{location.state}, {location.country}</span>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                location.approvalStatus === 'APPROVED' ? 'bg-success text-white' :
                location.approvalStatus === 'PENDING' ? 'bg-warning text-white' :
                'bg-error text-white'
              }`}>
                {location.approvalStatus}
              </span>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-secondary leading-relaxed">{location.description}</p>
            </div>
          </div>

          {/* Image Gallery */}
          {location.images && location.images.length > 1 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {location.images.slice(1).map((image, index) => (
                  <div key={index} className="relative h-48 rounded-lg overflow-hidden bg-surface">
                    <img
                      src={image}
                      alt={`${location.area} ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-secondary mb-1">Country</p>
                <p className="font-medium">{location.country}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">State</p>
                <p className="font-medium">{location.state}</p>
              </div>
              <div>
                <p className="text-xs text-secondary mb-1">Added On</p>
                <p className="font-medium">{new Date(location.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Events
              </button>
              <button className="w-full btn bg-surface border border-border py-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                View Packages
              </button>
              <button className="w-full btn bg-surface border border-border py-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
