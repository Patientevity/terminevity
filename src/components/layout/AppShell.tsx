import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { PanelManager } from './PanelManager';
import { useAppStore } from '@/stores/app-store';
import { api } from '@/lib/ipc';

export function AppShell() {
  const { isVisible, setVisible } = useAppStore();

  useEffect(() => {
    const unsubShow = api.window.onAnimateShow(() => {
      setVisible(true);
    });

    const unsubHide = api.window.onAnimateHide(() => {
      setVisible(false);
      // After animation completes, tell main process to hide window
      setTimeout(() => {
        api.window.hideComplete();
      }, 300);
    });

    return () => {
      unsubShow();
      unsubHide();
    };
  }, [setVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex flex-col h-screen w-screen bg-background"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <PanelManager />
          </div>
          <StatusBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
