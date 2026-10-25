import { useEffect, useRef, useState } from 'react';
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (prefersReducedMotion || isTouchDevice) {
      setIsTouch(true);
      return;
    }

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let animationFrameId;

    const updateCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setPosition({ x: mouseX, y: mouseY });
    };

    const animateFollower = () => {
      const smoothFactor = 0.15;
      followerX += (mouseX - followerX) * smoothFactor;
      followerY += (mouseY - followerY) * smoothFactor;
      setFollowerPosition({ x: followerX, y: followerY });
      animationFrameId = requestAnimationFrame(animateFollower);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .pcard, .category-tile')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, .pcard, .category-tile')) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    animateFollower();

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--gold)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate(${position.x - 4}px, ${position.y - 4}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />
      <div
        ref={followerRef}
        className="custom-cursor-follower"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '50px' : '30px',
          height: isHovering ? '50px' : '30px',
          border: `2px solid var(--gold)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: `translate(${followerPosition.x - (isHovering ? 25 : 15)}px, ${followerPosition.y - (isHovering ? 25 : 15)}px)`,
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease',
          opacity: 0.7,
        }}
      />
    </>
  );
}
