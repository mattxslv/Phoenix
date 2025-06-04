import { useEffect, useState, useRef } from 'react';

const Typewriter = ({ text = '', speed = 30, onDone, render }) => {
  const [displayed, setDisplayed] = useState('');
  const startTimeRef = useRef();
  const rafRef = useRef();

  useEffect(() => {
    if (!text) {
      setDisplayed('');
      return;
    }
    setDisplayed('');
    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const charsToShow = Math.min(
        text.length,
        Math.floor(elapsed / speed)
      );
      setDisplayed(text.slice(0, charsToShow));
      if (charsToShow < text.length) {
        rafRef.current = requestAnimationFrame(animate);
      } else if (onDone) {
        onDone();
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, onDone]);

  const safeDisplayed =
    typeof displayed === 'string'
      ? displayed.replace(/undefined\s*$/i, '')
      : '';

  return render ? render(safeDisplayed) : <span>{safeDisplayed}</span>;
};

export default Typewriter;