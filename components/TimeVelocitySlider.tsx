"use client";

import { Clock } from "lucide-react";

interface TimeVelocitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TimeVelocitySlider({
  value,
  onChange,
}: TimeVelocitySliderProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-cyan-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="text-cyan-400" size={16} />
          <span className="text-cyan-400 text-sm font-semibold tracking-wider">
            TIME VELOCITY
          </span>
        </div>
        <span className="text-cyan-300 font-mono text-lg">
          {value.toFixed(0)}-00
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="72"
          step="1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #06B6D4 0%, #06B6D4 ${
              (value / 72) * 100
            }%, #334155 ${(value / 72) * 100}%, #334155 100%)`,
          }}
        />
        
        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
          <span>00:00</span>
          <span>08:00</span>
          <span>16:00</span>
          <span>24:00</span>
          <span>32:00</span>
          <span>40:00</span>
          <span>48:00</span>
          <span>56:00</span>
          <span>72:00</span>
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-3">
        Filter transactions by time window (0-72 hours)
      </p>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #06B6D4;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #06B6D4;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
