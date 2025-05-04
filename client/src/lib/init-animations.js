
import { initScrollAnimations } from './animations';

export const setupAnimations = () => {
  // Set up intersection observer for scroll animations
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    
    // Re-initialize on route changes for single page applications
    const handleRouteChange = () => {
      setTimeout(() => {
        initScrollAnimations();
      }, 100);
    };
    
    // For applications using client-side routing
    window.addEventListener('popstate', handleRouteChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  });
};
