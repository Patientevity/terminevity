import React, { useEffect, useRef } from 'react';
import { useTerminal } from '@/hooks/useTerminal';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  id: string;
  isActive: boolean;
}

export function TerminalComponent({ id, isActive }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { init, fit, focus } = useTerminal({ id });

  useEffect(() => {
    if (containerRef.current) {
      init(containerRef.current);
    }
  }, [init]);

  useEffect(() => {
    if (isActive) {
      // Small delay to ensure the container is properly sized
      const timer = setTimeout(() => {
        fit();
        focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isActive, fit, focus]);

  useEffect(() => {
    const handleResize = () => fit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fit]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  );
}
