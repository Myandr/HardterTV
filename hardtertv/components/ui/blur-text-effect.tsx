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
    const words = el.querySelectorAll('span.word');

    gsap.set(words, { opacity: 0, y: 10, filter: 'blur(8px)' });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(words, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.07,
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

  const wordList = children.split(' ');

  return (
    <span className={`inline ${className}`} ref={containerRef}>
      {wordList.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="word inline-block">{word}</span>
          {i < wordList.length - 1 && ' '}
        </React.Fragment>
      ))}
    </span>
  );
};
