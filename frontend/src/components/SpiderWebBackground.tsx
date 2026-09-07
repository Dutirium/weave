import { useEffect, useRef } from 'react';

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isMouse?: boolean;
}

interface MousePosition {
  x: number | null;
  y: number | null;
}

export default function SpiderWebBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse: MousePosition = { x: null, y: null };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const numNodes = Math.floor((width * height) / 9000);
    const nodes: NodePoint[] = Array.from({ length: numNodes }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 2.2, // Slightly larger node dots
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const allPoints: NodePoint[] =
        mouse.x !== null && mouse.y !== null
          ? [
              ...nodes,
              {
                x: mouse.x,
                y: mouse.y,
                vx: 0,
                vy: 0,
                radius: 0,
                isMouse: true,
              },
            ]
          : nodes;

      // Draw Nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 146, 60, 0.85)'; // Brighter orange dots
        ctx.fill();
      });

      // Draw Web Connections
      const maxDistance = 150; // Increased connection reach
      for (let i = 0; i < allPoints.length; i++) {
        for (let j = i + 1; j < allPoints.length; j++) {
          const dx = allPoints[i].x - allPoints[j].x;
          const dy = allPoints[i].y - allPoints[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = 1 - dist / maxDistance;
            ctx.beginPath();
            ctx.moveTo(allPoints[i].x, allPoints[i].y);
            ctx.lineTo(allPoints[j].x, allPoints[j].y);

            // Increased line brightness & stroke width
            if (allPoints[i].isMouse || allPoints[j].isMouse) {
              ctx.strokeStyle = `rgba(251, 146, 60, ${opacity * 0.95})`; // Intense orange near cursor
              ctx.lineWidth = 1.8;
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.35})`; // High visibility white strands
              ctx.lineWidth = 1.0;
            }
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}