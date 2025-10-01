// @ts-nocheck
"use client";
import './GradientText.css';

export default function GradientText({
  children,
  className = '',
  colors = ['#ff8a80', '#ffc17e', '#ff8a80', '#ffc17e', '#ff8a80'],
  animationSpeed = 6,
  showBorder = false
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`
  };

  return (
    <div className={`animated-gradient-text ${className}`}>
      {showBorder && <div className="gradient-overlay" style={gradientStyle}></div>}
      <div className="text-content" style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}
