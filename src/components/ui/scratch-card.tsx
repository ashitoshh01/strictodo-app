
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ScratchCardProps {
  couponCode: string;
  amount: number;
  onReveal?: () => void;
}

const ScratchCard = ({ couponCode, amount, onReveal }: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 150;

    // Draw scratch surface
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal!', canvas.width / 2, canvas.height / 2);

    // Set up erasing
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Check if enough area is scratched
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparentPixels++;
    }

    const scratchedPercentage = transparentPixels / (canvas.width * canvas.height);
    if (scratchedPercentage > 0.3 && !isScratched) {
      setIsScratched(true);
      onReveal?.();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  return (
    <Card className="w-80 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500">
      <CardContent className="p-6 text-center relative">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2">🎉 Congratulations! 🎉</h3>
          <p className="text-white text-sm">You've earned a reward!</p>
        </div>
        
        <div className="relative inline-block">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold pointer-events-none select-none" style={{ zIndex: -1 }}>
            <div className="text-2xl mb-2">₹{amount}</div>
            <div className="text-sm">Coupon Code:</div>
            <div className="text-lg font-mono bg-white text-black px-2 py-1 rounded">
              {couponCode}
            </div>
          </div>
          
          <canvas
            ref={canvasRef}
            className="cursor-pointer touch-none relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              width: '300px', 
              height: '150px',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              zIndex: 1
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
          />
        </div>

        {isScratched && (
          <div className="mt-4 text-white text-sm">
            <p>Save this coupon code for future use!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScratchCard;
