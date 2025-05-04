
/**
 * Handles animations for elements with the animate-on-scroll class
 */
export const initScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  animatedElements.forEach((element) => {
    observer.observe(element);
  });
  
  return () => {
    animatedElements.forEach((element) => {
      observer.unobserve(element);
    });
  };
};

/**
 * Adds a light parallax effect to an element based on mouse movement
 * @param {string} selector - CSS selector for the element
 * @param {number} strength - Strength of the effect (1-10)
 */
export const addMouseParallax = (selector, strength = 5) => {
  const element = document.querySelector(selector);
  
  if (!element) return;
  
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const xPos = (clientX / innerWidth - 0.5) * strength;
    const yPos = (clientY / innerHeight - 0.5) * strength;
    
    element.style.transform = `translate(${xPos}px, ${yPos}px)`;
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
  };
};

/**
 * Adds a typing effect to a text element
 * @param {string} selector - CSS selector for the element
 * @param {string} text - Text to type
 * @param {number} speed - Typing speed in milliseconds
 */
export const typeText = (selector, text, speed = 100) => {
  const element = document.querySelector(selector);
  
  if (!element) return;
  
  element.textContent = '';
  
  let i = 0;
  const typing = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typing);
    }
  }, speed);
  
  return () => {
    clearInterval(typing);
  };
};
