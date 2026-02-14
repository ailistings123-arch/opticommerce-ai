interface CharacterCounterProps {
  current: number;
  max: number;
  optimal?: { min: number; max: number };
  className?: string;
}

export default function CharacterCounter({ current, max, optimal, className = '' }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  
  const getStatus = () => {
    if (optimal) {
      if (current < optimal.min) return 'low';
      if (current > optimal.max) return 'high';
      return 'optimal';
    }
    
    if (current > max * 0.9) return 'high';
    if (current < max * 0.5) return 'low';
    return 'good';
  };

  const status = getStatus();
  
  const statusStyles = {
    low: 'text-red-500',
    good: 'text-yellow-500', 
    optimal: 'text-green-500',
    high: 'text-orange-500'
  };

  const statusMessages = {
    low: optimal ? `Use ${optimal.min - current} more chars for better SEO` : 'Consider adding more content',
    good: 'Good length',
    optimal: 'Perfect length for SEO!',
    high: optimal ? `${current - optimal.max} chars over optimal` : 'Consider shortening'
  };

  const barColors = {
    low: 'bg-red-400',
    good: 'bg-yellow-400',
    optimal: 'bg-green-400', 
    high: 'bg-orange-400'
  };

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-medium ${statusStyles[status]}`}>
          {current}/{max} characters
        </span>
        <span className={`text-xs ${statusStyles[status]}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColors[status]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className={`text-xs ${statusStyles[status]} flex items-center gap-1`}>
        {status === 'low' && '⚠️'}
        {status === 'optimal' && '✅'}
        {status === 'high' && '⚠️'}
        <span>{statusMessages[status]}</span>
      </div>
    </div>
  );
}