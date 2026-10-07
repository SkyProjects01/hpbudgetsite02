import React from 'react';

type CircularProgressProps = {
  value: number; // percentage (0 to 100+)
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
};

export function CircularProgress({
  value,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
}: CircularProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  const isOverBudget = value > 100;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 transition-transform duration-500"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800/80 fill-transparent"
        />
        {/* Active Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`fill-transparent transition-all duration-700 ease-out ${
            isOverBudget ? 'text-zinc-100' : 'text-white'
          }`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center px-2">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {label ?? `${Math.round(value)}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
