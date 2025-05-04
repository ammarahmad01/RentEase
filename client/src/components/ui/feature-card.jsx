
import { MotionEffect } from './motion-effect';

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  delay = 0,
  className = "" 
}) => {
  return (
    <MotionEffect animation="animate-fade-in" delay={delay}>
      <div className={`glass-card rounded-xl p-6 ${className}`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
            {Icon && <Icon className="h-6 w-6" />}
          </div>
          <h3 className="mb-2 text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </MotionEffect>
  );
};

export { FeatureCard };
