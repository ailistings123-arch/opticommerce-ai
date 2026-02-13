import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400',
          error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400',
          'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <textarea
        className={clsx(
          'w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400',
          error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400',
          'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed resize-none',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}
