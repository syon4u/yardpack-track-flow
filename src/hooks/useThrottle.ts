import { useRef, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = now;
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRan.current = Date.now();
      }, delay - (now - lastRan.current));
    }
  }, [callback, delay]) as T;
}

export function useScrollThrottle(callback: () => void, delay: number = 16) {
  const rafRef = useRef<number>();
  
  return useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      callback();
    });
  }, [callback]);
}