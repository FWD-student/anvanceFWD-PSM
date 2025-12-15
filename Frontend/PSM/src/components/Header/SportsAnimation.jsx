import React, { useState, useEffect, useCallback } from 'react';
import './sportsAnimation.css';

const SoccerBallIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 7 L15.5 10 L14 14 L10 14 L8.5 10 Z" fill="currentColor" opacity="0.4" />
    <path d="M12 2 L14 5 L12 7 L10 5 Z" fill="currentColor" opacity="0.3" />
    <path d="M12 7 L12 2" /><path d="M15.5 10 L20 8" /><path d="M14 14 L17 18" /><path d="M10 14 L7 18" /><path d="M8.5 10 L4 8" />
  </svg>
);

const BicycleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="5" cy="17" r="3" /><circle cx="19" cy="17" r="3" />
    <path d="M5 17 L9 9 L15 9 L19 17" /><path d="M9 9 L12 17 L19 17" /><path d="M12 17 L15 9" />
    <path d="M15 9 L17 7 L19 8" /><path d="M9 9 L7 7 L10 7" /><circle cx="12" cy="17" r="1.5" />
  </svg>
);

const SwimmerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="6" r="2.5" />
    <path d="M22 14 C20 12 18 13 16 12 L8 8 C7 7.5 6 7 5 8 L4 9 C5 10 6 10 7 10 L14 13 C16 14 18 15 20 14 L22 14 Z" />
    <path d="M16 12 L20 10 C21 9.5 22 9 23 10" strokeWidth="2" stroke="currentColor" fill="none" />
    <path d="M8 8 L6 11 M8 8 L5 12" strokeWidth="1.5" stroke="currentColor" fill="none" />
  </svg>
);

const SkateboardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 15 C2 15 2 13 4 13 L20 13 C22 13 22 15 20 15 Z" fill="currentColor" opacity="0.2" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
    <path d="M4 13 L20 13" strokeLinecap="round" />
  </svg>
);

const ANIMATIONS = [
  { id: 'soccer', Icon: SoccerBallIcon, duration: 2500 },
  { id: 'cycling', Icon: BicycleIcon, duration: 2800 },
  { id: 'swimming', Icon: SwimmerIcon, duration: 5000 },
  { id: 'skating', Icon: SkateboardIcon, duration: 1500 },
];

const TIMER_INTERVAL = 90000;

export default function SportsAnimation({ children }) {
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const animation = ANIMATIONS[animationIndex];
    setActiveAnimation(animation.id);
    
    setTimeout(() => {
      setActiveAnimation(null);
      setIsAnimating(false);
      setAnimationIndex((prev) => (prev + 1) % ANIMATIONS.length);
    }, animation.duration);
  }, [animationIndex, isAnimating]);

  useEffect(() => {
    const timer = setInterval(triggerAnimation, TIMER_INTERVAL);
    return () => clearInterval(timer);
  }, [triggerAnimation]);

  useEffect(() => {
    const initialTimer = setTimeout(triggerAnimation, 2000);
    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <span className="animated-title-wrapper" onMouseEnter={triggerAnimation}>
      {ANIMATIONS.map(({ id, Icon }) => (
        <Icon key={id} className={`sport-icon ${id} ${activeAnimation === id ? 'animate' : ''}`} />
      ))}
      <span className="categorias-populares-title-text">{children}</span>
    </span>
  );
}