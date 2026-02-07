import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepWelcome } from './StepWelcome';
import { StepGitHub } from './StepGitHub';
import { StepServices } from './StepServices';
import { StepComplete } from './StepComplete';
import { api } from '@/lib/ipc';
import { useAppStore } from '@/stores/app-store';

interface OnboardingData {
  name: string;
  goals: string;
  intents: string;
  preferredNoteTool: string;
  providers: {
    type: string;
    name: string;
    apiKey: string;
    model: string;
    enabled: boolean;
  }[];
}

export function OnboardingFlow() {
  const { setOnboarded } = useAppStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    goals: '',
    intents: '',
    preferredNoteTool: 'builtin',
    providers: [
      { type: 'claude', name: 'Claude', apiKey: '', model: 'claude-sonnet-4-5-20250929', enabled: false },
      { type: 'openai', name: 'ChatGPT', apiKey: '', model: 'gpt-4o', enabled: false },
      { type: 'gemini', name: 'Gemini', apiKey: '', model: 'gemini-2.0-flash', enabled: false },
    ],
  });

  const updateField = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const updateProvider = (index: number, field: string, value: string | boolean) => {
    setData((prev) => ({
      ...prev,
      providers: prev.providers.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const handleComplete = async () => {
    try {
      // Save profile
      await api.onboarding.saveProfile({
        name: data.name,
        goals: data.goals,
        intents: data.intents,
        preferredNoteTool: data.preferredNoteTool,
      });

      // Save enabled providers
      for (const provider of data.providers) {
        if (provider.enabled && provider.apiKey) {
          await api.ai.saveProvider({
            name: provider.name,
            type: provider.type,
            apiKey: provider.apiKey,
            model: provider.model,
            isDefault: provider.type === 'claude',
          });
        }
      }

      // Mark onboarding complete
      await api.onboarding.complete();
      setOnboarded(true);
    } catch (err) {
      console.error('Onboarding error:', err);
    }
  };

  const steps = [
    <StepWelcome
      key="welcome"
      data={data}
      onChange={updateField}
      onNext={() => setStep(1)}
    />,
    <StepGitHub
      key="github"
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
    />,
    <StepServices
      key="services"
      providers={data.providers}
      onChange={updateProvider}
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
    />,
    <StepComplete
      key="complete"
      preferredNoteTool={data.preferredNoteTool}
      onSelectNoteTool={(tool) => updateField('preferredNoteTool', tool)}
      onComplete={handleComplete}
      onBack={() => setStep(2)}
    />,
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-lg mx-auto p-8">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
