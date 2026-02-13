import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transform hover:scale-105 active:scale-95',
        {
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-blue-200 hover:shadow-lg': variant === 'primary',
          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-400': variant === 'secondary',
          'border-2 border-blue-600 text-blue-700 bg-white hover:bg-blue-50 focus:ring-blue-500': variant === 'outline',
          'px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm': size === 'sm',
          'px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base': size === 'md',
          'px-5 sm:px-7 py-2.5 sm:py-3.5 text-base sm:text-lg': size === 'lg',
          'opacity-60 cursor-not-allowed hover:scale-100': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
