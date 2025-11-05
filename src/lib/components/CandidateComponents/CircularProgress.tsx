import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  fontSize?: number;
  labelFontSize?: number;
  progressType?: "circle" | "half-circle";
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  label = 'Overall Score',
  fontSize = 24,
  labelFontSize = 12,
  progressType = "circle"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const gradientId = 'progress-gradient';

  return (
    <div style={{ position: 'relative', width: size, height: progressType === "circle" ? size : size * 0.8 }}>
      <svg
        width={size}
        height={size}
        style={{ transform: progressType === "circle" ? "rotate(-90deg)" : "none" }}
      >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#9FCAED" />
                  <stop offset="33%" stopColor="#CEB6DA" />
                  <stop offset="66%" stopColor="#EBACC9" />
                  <stop offset="100%" stopColor="#FCCEC0" />
            </linearGradient>
          </defs>
        
        {/* Background circle */}
       
        {progressType === "circle" ? 
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F5F5F5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        : <path
          d={`
            M ${size / 2 - radius},${size / 2}
            a ${radius},${radius} 0 0,1 ${radius * 2},0
          `}
          stroke="#F5F5F5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />}
        {/* Progress circle */}
        {progressType === "circle" ? 
         <circle
         cx={size / 2}
         cy={size / 2}
         r={radius}
         stroke={`url(#${gradientId})`}
         strokeWidth={strokeWidth}
         fill="none"
         strokeDasharray={strokeDasharray}
         strokeDashoffset={strokeDashoffset}
         strokeLinecap="round"
         style={{
           transition: 'stroke-dashoffset 0.5s ease-in-out'
         }}
       /> : 
       <path
          d={`
            M ${size / 2 - radius},${size / 2}
            a ${radius},${radius} 0 0,1 ${radius * 2},0
          `}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray / 2}
          strokeDashoffset={((1 - percentage / 100) * (strokeDasharray / 2))}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
        }
      </svg>
      
      {/* Center text */}
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            style={{
              fontSize: labelFontSize,
              color: '#535862',
              fontWeight: 500,
              marginBottom: '2px'
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: fontSize,
              color: '#181D27',
              fontWeight: 700
            }}
          >
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress; 