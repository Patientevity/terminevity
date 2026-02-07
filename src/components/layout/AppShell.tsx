import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { PanelManager } from './PanelManager';
import { useAppStore } from '@/stores/app-store';
import { api } from '@/lib/ipc';
import { useHotkeys } from '@/hooks/useHotkeys';

export function AppShell() {
  useHotkeys();
  const { isVisible, setVisible } = useAppStore();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubShow = api.window.onAnimateShow(() => {
      // Cancel any pending hide so it can't race with this show
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible(true);
    });

    const unsubHide = api.window.onAnimateHide(() => {
      setVisible(false);
      // After animation completes, tell main process to hide window
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        api.window.hideComplete();
      }, 300);
    });

    return () => {
      unsubShow();
      unsubHide();
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [setVisible]);

  return (
    <motion.div
      className="flex flex-col h-screen w-screen bg-background"
      animate={isVisible ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <PanelManager />
      </div>
      <StatusBar />
    </motion.div>
  );
}
