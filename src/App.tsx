import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useAppStore } from '@/stores/app-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useHotkeyStore } from '@/stores/hotkey-store';
import { api } from '@/lib/ipc';

export default function App() {
  const { isOnboarded, isOnboardingChecked, setOnboarded, setOnboardingChecked } = useAppStore();
  const { loadFromDb } = useSettingsStore();
  const { loadFromDb: loadHotkeys } = useHotkeyStore();

  useEffect(() => {
    async function init() {
      try {
        // Check onboarding status
        const onboarded = await api.onboarding.check();
        setOnboarded(onboarded);
        setOnboardingChecked(true);

        // Load settings from database
        await loadFromDb();
        await loadHotkeys();
      } catch (err) {
        console.error('Init error:', err);
        setOnboardingChecked(true);
      }
    }
    init();
  }, [setOnboarded, setOnboardingChecked, loadFromDb, loadHotkeys]);

  // Show loading state while checking
  if (!isOnboardingChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading Terminevity...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not complete
  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  // Show main app
  return <AppShell />;
}
