import React, { useEffect, useState } from 'react';

interface AuraVoiceWaveProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  height?: number;
  className?: string;
  mode?: 'listen' | 'speak';
}

const AuraVoiceWave: React.FC<AuraVoiceWaveProps> = ({ 
  isActive, 
  color = '#4f46e5',
  barCount = 12,
  height = 40,
  className = '',
  mode = 'listen'
}) => {
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  
  useEffect(() => {
    if (!isActive) {
      setAmplitudes(Array(barCount).fill(0));
      return;
    }
    
    // Generate initial random heights
    setAmplitudes(Array.from({ length: barCount }, () => Math.random() * 0.8));
    
    // Animation interval
    const interval = setInterval(() => {
      setAmplitudes(prev => {
        return prev.map((amp, i) => {
          if (mode === 'listen') {
            // More random for microphone input visualization
            const randomFactor = Math.random() * 0.4;
            const timeFactor = Math.sin(Date.now() / 200 + i) * 0.3;
            return Math.max(0.1, Math.min(1, amp * 0.6 + randomFactor + timeFactor));
          } else {
            // More rhythmic for speaking visualization
            const baseFactor = 0.3;
            const timeFactor = Math.sin(Date.now() / 150 + i / 2) * 0.7;
            return Math.max(0.1, Math.min(1, baseFactor + Math.abs(timeFactor)));
          }
        });
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive, barCount, mode]);
  
  return (
    <div 
      className={`flex items-end justify-center gap-[2px] ${className}`}
      style={{ height: `${height}px` }}
    >
      {amplitudes.map((amplitude, index) => (
        <div
          key={index}
          className="rounded-full transition-all duration-100"
          style={{
            backgroundColor: color,
            width: '3px',
            height: `${Math.max(4, amplitude * height)}px`,
            opacity: 0.3 + amplitude * 0.7
          }}
        />
      ))}
    </div>
  );
};

export default AuraVoiceWave;
