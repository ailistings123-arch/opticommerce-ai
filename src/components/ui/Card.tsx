import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className, title }: CardProps) {
  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in',
      className
    )}>
      {title && <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
