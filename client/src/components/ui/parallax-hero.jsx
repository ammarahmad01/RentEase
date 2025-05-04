
import { useEffect, useRef } from 'react';

const ParallaxHero = ({ 
  backgroundImage, 
  children, 
  strength = 300,
  height = "600px",
  overlay = true 
}) => {
  const parallaxRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollTop = window.pageYOffset;
        parallaxRef.current.style.transform = `translateY(${scrollTop / strength}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [strength]);
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{ height }}
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'translateY(0)',
          zIndex: -1,
          height: `calc(100% + ${strength}px)`,
          marginTop: `-${strength / 2}px`,
        }}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/30 z-0" />
      )}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export { ParallaxHero };
