import React, { useState, useRef, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

export default function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (val) => val.toString(),
  className = ''
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPercentage = useCallback((percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = (e: React.MouseEvent, handle: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const newValue = getValueFromPercentage(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step);
      onChange([newMin, value[1]]);
    } else if (isDragging === 'max') {
      const newMax = Math.max(newValue, value[0] + step);
      onChange([value[0], newMax]);
    }
  }, [isDragging, value, onChange, getValueFromPercentage, step]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div 
        ref={sliderRef}
        className="relative h-6 w-full cursor-pointer"
        onMouseDown={(e) => {
          if (!isDragging) {
            const rect = sliderRef.current!.getBoundingClientRect();
            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
            const newValue = getValueFromPercentage(percentage);
            
            // Determine which handle to move based on which is closer
            const distanceToMin = Math.abs(newValue - value[0]);
            const distanceToMax = Math.abs(newValue - value[1]);
            
            if (distanceToMin < distanceToMax) {
              const newMin = Math.min(newValue, value[1] - step);
              onChange([newMin, value[1]]);
            } else {
              const newMax = Math.max(newValue, value[0] + step);
              onChange([value[0], newMax]);
            }
          }
        }}
      >
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Active range */}
        <div 
          className="absolute top-1/2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-150"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        ></div>
        
        {/* Min handle */}
        <div
          className={`absolute top-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-150 hover:scale-110 ${
            isDragging === 'min' ? 'scale-110 shadow-xl' : ''
          }`}
          style={{ left: `calc(${minPercentage}% - 12px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {formatValue(value[0])}
          </div>
        </div>
        
        {/* Max handle */}
        <div
          className={`absolute top-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-150 hover:scale-110 ${
            isDragging === 'max' ? 'scale-110 shadow-xl' : ''
          }`}
          style={{ left: `calc(${maxPercentage}% - 12px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {formatValue(value[1])}
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

export default function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (val) => val.toString(),
  className = ''
}: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPercentage = useCallback((percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMouseDown = (e: React.MouseEvent, handle: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const newValue = getValueFromPercentage(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step);
      onChange([newMin, value[1]]);
    } else if (isDragging === 'max') {
      const newMax = Math.max(newValue, value[0] + step);
      onChange([value[0], newMax]);
    }
  }, [isDragging, value, onChange, getValueFromPercentage, step]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div 
        ref={sliderRef}
        className="relative h-6 w-full cursor-pointer"
        onMouseDown={(e) => {
          if (!isDragging) {
            const rect = sliderRef.current!.getBoundingClientRect();
            const percentage = ((e.clientX - rect.left) / rect.width) * 100;
            const newValue = getValueFromPercentage(percentage);
            
            // Determine which handle to move based on which is closer
            const distanceToMin = Math.abs(newValue - value[0]);
            const distanceToMax = Math.abs(newValue - value[1]);
            
            if (distanceToMin < distanceToMax) {
              const newMin = Math.min(newValue, value[1] - step);
              onChange([newMin, value[1]]);
            } else {
              const newMax = Math.max(newValue, value[0] + step);
              onChange([value[0], newMax]);
            }
          }
        }}
      >
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Active range */}
        <div 
          className="absolute top-1/2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-150"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        ></div>
        
        {/* Min handle */}
        <div
          className={`absolute top-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-150 hover:scale-110 ${
            isDragging === 'min' ? 'scale-110 shadow-xl' : ''
          }`}
          style={{ left: `calc(${minPercentage}% - 12px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {formatValue(value[0])}
          </div>
        </div>
        
        {/* Max handle */}
        <div
          className={`absolute top-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-150 hover:scale-110 ${
            isDragging === 'max' ? 'scale-110 shadow-xl' : ''
          }`}
          style={{ left: `calc(${maxPercentage}% - 12px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {formatValue(value[1])}
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
