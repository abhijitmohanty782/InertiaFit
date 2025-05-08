import React from 'react';

/**
 * ResponsiveButton - A flexible button component that provides consistent styling
 * and responsive behavior across the application.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {function} props.onClick - Click handler function
 * @param {string} props.type - Button type (e.g., 'button', 'submit')
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'outline', 'text')
 * @param {string} props.size - Button size ('sm', 'md', 'lg')
 * @param {boolean} props.fullWidth - Whether the button should take the full width
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether to show a loading state
 * @param {string} props.className - Additional CSS classes
 */
const ResponsiveButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  // Base classes for all buttons
  let baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Size classes
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-2 py-1 text-xs sm:text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg';
      break;
    case 'md':
    default:
      sizeClasses = 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base';
  }
  
  // Variant classes
  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses = 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600';
      break;
    case 'outline':
      variantClasses = 'bg-transparent hover:bg-gray-700 text-orange-500 border border-orange-500 hover:border-orange-400';
      break;
    case 'text':
      variantClasses = 'bg-transparent text-orange-500 hover:text-orange-400 hover:bg-gray-800';
      break;
    case 'primary':
    default:
      variantClasses = 'bg-orange-500 hover:bg-orange-600 text-white border border-transparent';
  }
  
  // Disabled and loading states
  if (disabled || loading) {
    variantClasses = 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-600';
  }
  
  const classes = `${baseClasses} ${sizeClasses} ${variantClasses} ${widthClasses} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default ResponsiveButton; 