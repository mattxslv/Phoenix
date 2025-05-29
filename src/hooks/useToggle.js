  

/**
 * Node modules
 */
import { useState, useCallback } from 'react';

/**
 * A custom React hook for managing a toggle state.
 *
 * @returns {[boolean, Function]} An array containing the current toggle state (boolean) and a function to toggle the state.
 */
const useToggle = () => {
  const [isOpen, setToggle] = useState(false);

  const toggle = useCallback(() => {
    setToggle((prev) => !prev);
  }, []);

  return [isOpen, toggle];
};

export { useToggle };
