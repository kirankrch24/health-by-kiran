'use client';
import { useEffect, useRef } from 'react';

let toastQueue: ((msg: string, type: 'success' | 'error') => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastQueue?.(message, type);
}

export default function ToastContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    toastQueue = (message, type) => {
      const container = containerRef.current;
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<span>${message}</span>`;
      container.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
      }, 3500);
    };
    return () => { toastQueue = null; };
  }, []);

  return <div ref={containerRef} className="toast-container" />;
}
