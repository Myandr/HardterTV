'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface BlurTextEffectProps {
  children: string;
  className?: string;
}

export const BlurTextEffect: React.FC<BlurTextEffectProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const chars = el.querySelectorAll('span.char');

    gsap.set(chars, { opacity: 0, y: 10, filter: 'blur(8px)' });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(chars, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.3,
            ease: 'power2.out',
            stagger: 0.015,
            clearProps: 'filter',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-40px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <span className={`inline-block ${className}`} ref={containerRef}>
      {children.split('').map((char, i) => (
        <span key={`${char}-${i}`} className="char inline-block" style={{ whiteSpace: 'pre' }}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
};
