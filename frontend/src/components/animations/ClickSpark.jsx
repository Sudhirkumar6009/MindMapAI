import { useEffect, useRef, useState } from 'react';

export const ClickSpark = ({
  sparkColor = '#ffffff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1
}) => {
  const containerRef = useRef(null);
  const [sparks, setSparks] = useState([]);

  const handleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (360 / sparkCount) * i,
      distance: sparkRadius,
      size: sparkSize,
      color: sparkColor
    }));

    setSparks(prev => [...prev, ...newSparks]);

    setTimeout(() => {
      setSparks(prev => prev.filter(spark => !newSparks.find(n => n.id === spark.id)));
    }, duration);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ position: 'absolute', inset: 0 }}
    >
      {sparks.map(spark => (
        <div
          key={spark.id}
          style={{
            position: 'absolute',
            left: spark.x,
            top: spark.y,
            width: spark.size,
            height: spark.size,
            backgroundColor: spark.color,
            borderRadius: '50%',
            pointerEvents: 'none',
            transform: `
              translate(
                ${Math.cos(spark.angle * Math.PI / 180) * spark.distance * extraScale}px,
                ${Math.sin(spark.angle * Math.PI / 180) * spark.distance * extraScale}px
              )
            `,
            animation: `spark ${duration}ms ${easing} forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes spark {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              ${Math.cos(0) * sparkRadius * extraScale}px,
              ${Math.sin(0) * sparkRadius * extraScale}px
            ) scale(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ClickSpark;
