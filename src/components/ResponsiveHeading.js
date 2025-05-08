import React from 'react';

/**
 * ResponsiveHeading - A component that provides consistent and responsive typography 
 * for headings across the application.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The text content of the heading
 * @param {string} props.level - Heading level: 'h1', 'h2', 'h3', or 'h4'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.centered - Whether the heading should be centered
 * @param {string} props.color - Text color class (default is app primary color)
 */
const ResponsiveHeading = ({ 
  children, 
  level = 'h1', 
  className = '', 
  centered = false,
  color = 'text-orange-500'
}) => {
  const baseClasses = `font-bold ${color} ${centered ? 'text-center' : ''}`;
  
  // Define responsive sizing based on heading level
  let sizeClasses = '';
  switch(level) {
    case 'h1':
      sizeClasses = 'text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4';
      break;
    case 'h2':
      sizeClasses = 'text-xl sm:text-2xl md:text-3xl mb-2 md:mb-3';
      break;
    case 'h3':
      sizeClasses = 'text-lg sm:text-xl md:text-2xl mb-2';
      break;
    case 'h4':
      sizeClasses = 'text-base sm:text-lg md:text-xl mb-1 md:mb-2';
      break;
    default:
      sizeClasses = 'text-lg md:text-xl mb-2';
  }
  
  const classes = `${baseClasses} ${sizeClasses} ${className}`;
  
  // Render the appropriate heading element
  switch(level) {
    case 'h1':
      return <h1 className={classes}>{children}</h1>;
    case 'h2':
      return <h2 className={classes}>{children}</h2>;
    case 'h3':
      return <h3 className={classes}>{children}</h3>;
    case 'h4':
      return <h4 className={classes}>{children}</h4>;
    default:
      return <h2 className={classes}>{children}</h2>;
  }
};

export default ResponsiveHeading; 