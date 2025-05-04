
import { useEffect, useRef } from 'react';

const MotionEffect = ({ 
  children, 
  animation = 'fade-in', 
  delay = 0,
  duration = 500,
  threshold = 0.1 
}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add(animation);
            entry.target.style.opacity = 1;
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: threshold,
      }
    );
    
    const currentRef = ref.current;
    
    if (currentRef) {
      currentRef.style.opacity = 0;
      currentRef.style.transitionDuration = `${duration}ms`;
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [animation, delay, duration, threshold]);
  
  return (
    <div ref={ref} className={`transition-all`}>
      {children}
    </div>
  );
};

export { MotionEffect };
