import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-egg-shell bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-brand-blue border-t-transparent mx-auto mb-2`} />
        {message && (
          <p className="text-brand-blue text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;