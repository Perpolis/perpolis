"use client";

import { useEffect, useRef } from "react";

interface InteractiveGridOverlayProps {
  className?: string;
  gridSize?: number;
  influenceRadius?: number;
}

export function InteractiveGridOverlay({ 
  className = "",
  gridSize = 36,
  influenceRadius = 180
}: InteractiveGridOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const fadeRef = useRef(0);
  const targetFadeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Draw static grid once
      drawGrid(ctx, canvas, dpr, cursorRef.current, fadeRef.current);
    };

    const drawGrid = (
      ctx: CanvasRenderingContext2D, 
      canvas: HTMLCanvasElement, 
      dpr: number,
      cursor: { x: number, y: number },
      currentFade: number
    ) => {
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 1;

      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      const getOpacity = (x: number, y: number) => {
        const dx = x - cursor.x;
        const dy = y - cursor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < influenceRadius) {
          const influence = 1 - (dist / influenceRadius);
          const smoothInfluence = influence * influence * (3 - 2 * influence);
          return 0.08 + (smoothInfluence * 0.7 * currentFade);
        }
        return 0.08;
      };

      // Draw vertical lines
      for (let col = 0; col <= cols; col++) {
        const x = col * gridSize;
        const segmentHeight = gridSize / 2;
        
        for (let y = 0; y <= height; y += segmentHeight) {
          const opacity = getOpacity(x, y + segmentHeight / 2);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.moveTo(x, y);
          ctx.lineTo(x, Math.min(y + segmentHeight, height));
          ctx.stroke();
        }
      }

      // Draw horizontal lines
      for (let row = 0; row <= rows; row++) {
        const y = row * gridSize;
        const segmentWidth = gridSize / 2;
        
        for (let x = 0; x <= width; x += segmentWidth) {
          const opacity = getOpacity(x + segmentWidth / 2, y);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.moveTo(x, y);
          ctx.lineTo(Math.min(x + segmentWidth, width), y);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Smooth fade
      fadeRef.current += (targetFadeRef.current - fadeRef.current) * 0.1;
      
      // Check if we need to keep animating
      const fadeDiff = Math.abs(targetFadeRef.current - fadeRef.current);
      
      if (fadeDiff > 0.01) {
        drawGrid(ctx, canvas, dpr, cursorRef.current, fadeRef.current);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Final draw and stop
        fadeRef.current = targetFadeRef.current;
        drawGrid(ctx, canvas, dpr, cursorRef.current, fadeRef.current);
        isAnimatingRef.current = false;
      }
    };

    const startAnimation = () => {
      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    const parent = canvas.parentElement;
    if (parent) resizeObserver.observe(parent);

    // Pointer tracking
    const section = canvas.closest('section');
    if (section) {
      const handlePointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        cursorRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        targetFadeRef.current = 1;
        startAnimation();
      };

      const handlePointerLeave = () => {
        targetFadeRef.current = 0;
        startAnimation();
      };

      section.addEventListener("pointermove", handlePointerMove, { passive: true });
      section.addEventListener("pointerleave", handlePointerLeave, { passive: true });

      return () => {
        cancelAnimationFrame(animationRef.current);
        resizeObserver.disconnect();
        section.removeEventListener("pointermove", handlePointerMove);
        section.removeEventListener("pointerleave", handlePointerLeave);
      };
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [gridSize, influenceRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1, contain: 'strict' }}
    />
  );
}
