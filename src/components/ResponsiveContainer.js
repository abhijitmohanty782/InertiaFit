import React from 'react';

/**
 * ResponsiveContainer - A flexible container component that provides consistent 
 * responsive padding and max-width constraints across the application.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be rendered inside the container
 * @param {string} props.className - Additional CSS classes to apply
 * @param {string} props.maxWidth - Maximum width of the container (default: 'max-w-7xl')
 * @param {string} props.padding - Padding classes (default: 'px-4 py-6 md:py-8')
 */
const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = 'max-w-7xl',
  padding = 'px-4 py-6 md:py-8'
}) => {
  return (
    <div className={`mx-auto ${maxWidth} ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer; 
