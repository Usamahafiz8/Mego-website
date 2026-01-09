'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'left',
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variantStyles = {
            primary:
                'bg-gradient-to-br from-primary-900 to-primary-700 text-white shadow-soft hover:shadow-medium hover:-translate-y-0.5 focus:ring-primary-500',
            secondary:
                'bg-white dark:bg-black text-primary-900 dark:text-primary-400 border-2 border-primary-900 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-gray-900 focus:ring-primary-500',
            accent:
                'bg-gradient-to-br from-accent-400 to-accent-500 text-black shadow-soft hover:shadow-medium hover:-translate-y-0.5 hover:shadow-glow-yellow focus:ring-accent-400',
            ghost:
                'text-primary-900 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 focus:ring-primary-500',
            outline:
                'border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-900 dark:hover:border-primary-700 hover:text-primary-900 dark:hover:text-primary-400 focus:ring-primary-500',
        };

        const sizeStyles = {
            sm: 'text-sm px-4 py-2 gap-1.5',
            md: 'text-base px-6 py-3 gap-2',
            lg: 'text-lg px-8 py-4 gap-2.5',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!loading && icon && iconPosition === 'left' && icon}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </button>
        );
    }
);

Button.displayName = 'Button';
