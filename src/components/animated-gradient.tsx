import React from 'react';

export function AnimatedGradient() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* This component creates the animated pink/green gradient line effect seen in ChatGPT UI */}
      <div className="absolute inset-0 flex flex-col justify-around gap-3">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`h-1.5 rounded-full bg-gradient-to-r ${
              i % 3 === 0 
                ? 'from-pink-400 to-green-300 w-full' 
                : i % 2 === 0 
                  ? 'from-pink-400 to-green-300 w-4/5' 
                  : 'from-pink-400 to-green-300 w-2/3'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
