'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';

export interface CategoryCardProps {
    id?: string;
    name: string;
    icon?: LucideIcon;
    image?: string;
    count?: number;
    href?: string;
    onClick?: () => void;
    color?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    name,
    icon: Icon,
    image,
    count,
    href,
    onClick,
    color,
}) => {
    const iconBgClass = color || 'from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900';
    const cardContent = (
        <>
            {/* Icon/Image Container with Gradient Background */}
            <div className={`relative flex items-center justify-center w-20 h-20 mb-5 rounded-3xl bg-gradient-to-br ${iconBgClass} transition-all duration-500 group-hover:scale-110 group-hover:shadow-glow overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {image ? (
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/80 dark:bg-white/90 rounded-2xl"></div>
                        <Image
                            src={image}
                            alt={name}
                            width={80}
                            height={80}
                            className="w-14 h-14 object-contain transition-all duration-500 group-hover:scale-110 relative z-10 drop-shadow-sm rounded-xl"
                        />
                    </div>
                ) : Icon ? (
                    <Icon className="w-10 h-10 text-primary-900 dark:text-primary-400 transition-all duration-500 group-hover:scale-110 relative z-10" />
                ) : null}
            </div>

            {/* Category Name */}
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-primary-800 dark:group-hover:text-primary-300">
                {name}
            </h3>

            {/* Item Count */}
            {count !== undefined && (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                    {count.toLocaleString()} {count === 1 ? 'item' : 'items'}
                </p>
            )}

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
        </>
    );

    const baseClasses =
        'group relative flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-800 backdrop-blur-sm transition-all duration-500 hover:border-primary-300 dark:hover:border-primary-800 hover:-translate-y-2 hover:shadow-luxury dark:hover:shadow-2xl cursor-pointer overflow-hidden';

    // Gradient overlay on hover
    const overlayClasses = "absolute inset-0 bg-gradient-to-br from-primary-900/5 via-transparent to-accent-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none";

    if (href) {
        return (
            <Link href={href} className={baseClasses}>
                <div className={overlayClasses}></div>
                {cardContent}
            </Link>
        );
    }

    return (
        <div onClick={onClick} className={baseClasses}>
            <div className={overlayClasses}></div>
            {cardContent}
        </div>
    );
};
