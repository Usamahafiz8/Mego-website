'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, MapPin, Clock } from 'lucide-react';
import { getImageUrl } from '@/lib/api';

export interface AdCardProps {
    id: number;
    title: string;
    price: string | number;
    location?: string;
    timeAgo?: string;
    image?: string | null;
    isFavorite?: boolean;
    onFavoriteToggle?: (id: number) => void;
}

export const AdCard: React.FC<AdCardProps> = ({
    id,
    title,
    price,
    location,
    timeAgo,
    image,
    isFavorite = false,
    onFavoriteToggle,
}) => {
    const [isBookmarked, setIsBookmarked] = useState(isFavorite);
    const [imageError, setImageError] = useState(false);

    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        onFavoriteToggle?.(id);
    };

    const imageUrl = image ? getImageUrl(image) : '/placeholder-image.jpg';

    return (
        <Link href={`/ads/${id}`}>
            <div className="group relative flex flex-col bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-large dark:hover:shadow-luxury cursor-pointer">
                {/* Image Section */}
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    {!imageError ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={() => setImageError(true)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}

                    {/* Bookmark Icon */}
                    <button
                        onClick={handleBookmarkClick}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10"
                        aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Bookmark
                            className={`w-5 h-5 transition-colors ${isBookmarked
                                    ? 'fill-accent-400 text-accent-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                        />
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                    {/* Price */}
                    <div className="inline-flex items-center self-start px-3 py-1 rounded-lg bg-primary-900 text-white text-lg font-bold shadow-soft">
                        PKR {typeof price === 'number' ? price.toLocaleString() : price}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-900 dark:group-hover:text-primary-400 transition-colors">
                        {title}
                    </h3>

                    {/* Location and Time */}
                    <div className="flex flex-col gap-1 mt-auto text-sm text-gray-600 dark:text-gray-400">
                        {location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{location}</span>
                            </div>
                        )}
                        {timeAgo && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{timeAgo}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};
