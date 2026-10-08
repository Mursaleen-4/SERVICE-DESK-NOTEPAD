import React, { useState, useEffect, useRef } from 'react';

export default function BackgroundVideo({
  videoTheme,
  opacity,
  isPlaying,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Video source logic
  const getVideoSrc = () => {
    if (videoTheme === 'ambient') return '/videos/bg-ambient.mp4';
    if (videoTheme === 'jellyfish') return '/videos/bg-jellyfish.mp4';

    return null; // For 'cyber-canvas' theme
  };

  const videoSrc = getVideoSrc();

  // Procedural Cyber Matrix Canvas animation (Runs at 60fps when cyber-canvas theme is active)
  useEffect(() => {
    if (videoTheme !== 'cyber-canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle nodes for high-tech telemetry network
    const nodes = Array.from({ length: 65 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
    }));

    const render = () => {
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw connecting lines between nodes
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;

        if (nodeA.x < 0 || nodeA.x > canvas.width) nodeA.vx *= -1;
        if (nodeA.y < 0 || nodeA.y > canvas.height) nodeA.vy *= -1;

        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoTheme]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-black select-none">
      {/* Video Element for MP4 */}
      {videoTheme !== 'cyber-canvas' && videoSrc && (
        <video
          ref={videoRef}
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: isPlaying ? 1 : 0.4 }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback/Cyber Telemetry Canvas */}
      {videoTheme === 'cyber-canvas' && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* High-Contrast Professional Dark Tint Overlay */}
      {/* NO color gradients: Solid deep slate tint with adjustable density */}
      <div
        className="absolute inset-0 bg-[#07090e] transition-opacity duration-300"
        style={{ opacity: opacity }}
      />

      {/* Subtle crisp tactical scanlines */}
      <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
    </div>
  );
}
