import React, { useState, useEffect } from 'react';

interface VoiceWaveEffectProps {
  isActive: boolean;
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

/**
 * A component that renders an animated voice wave visualization
 * to provide visual feedback during voice input
 */
const VoiceWaveEffect: React.FC<VoiceWaveEffectProps> = ({
  isActive,
  color = 'rgba(255, 255, 255, 0.8)',
  height = 40,
  width = 120,
  className = '',
}) => {
  const [levels, setLevels] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  
  useEffect(() => {
    if (!isActive) {
      setLevels([0, 0, 0, 0, 0, 0, 0]);
      return;
    }
    
    const interval = window.setInterval(() => {
      setLevels(prevLevels => {
        // Generate random wave heights when active
        return prevLevels.map(() => isActive ? Math.random() * 0.8 + 0.2 : 0);
      });
    }, 150);
    
    return () => window.clearInterval(interval);
  }, [isActive]);

  return (
    <div 
      className={`flex items-center justify-center space-x-1 ${className}`}
      style={{ height: `${height}px`, width: `${width}px` }}
      aria-hidden="true"
    >
      {levels.map((level, index) => (
        <div
          key={index}
          className="rounded-full transition-all duration-150 ease-in-out"
          style={{
            backgroundColor: color,
            width: '4px',
            height: `${Math.max(3, level * height)}px`,
            opacity: isActive ? 0.8 : 0.3,
            transform: `scaleY(${isActive ? level : 0.1})`,
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveEffect;
