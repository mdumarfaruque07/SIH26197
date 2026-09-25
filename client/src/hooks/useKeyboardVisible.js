import { useState, useEffect } from 'react';

/**
 * Hook to detect if a mobile virtual keyboard is currently open.
 * Uses visualViewport height shrinkage and focus tracking.
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // 1. Modern Android / iOS visualViewport API
    const handleViewportChange = () => {
      if (window.visualViewport) {
        // Keyboard typically occupies 25% to 50% of the screen height
        const isShrunk = window.visualViewport.height < window.innerHeight * 0.78;
        const isInputActive =
          document.activeElement &&
          ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        setIsKeyboardVisible(Boolean(isShrunk || (isInputActive && window.visualViewport.height < window.innerHeight)));
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    // 2. Global focus listeners as robust fallback
    const handleFocusIn = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      // Small timeout to allow next element focus if switching fields
      setTimeout(() => {
        const isInputStillActive =
          document.activeElement &&
          ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        if (!isInputStillActive) {
          setIsKeyboardVisible(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isKeyboardVisible;
}
