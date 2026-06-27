import React, {useState, useEffect} from 'react';
import {loadSettings, saveSettings} from './store/settings';
import {getColors, type ThemeMode, type Colors} from '../theme';
import {AppSettings} from '../types';
import {setApiKey} from './services/nvidia-ai';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import ChatScreen from './screens/ChatScreen';
import CoverLetterDetailScreen from './screens/CoverLetterDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import {CoverLetter} from '../types';

type Screen = 'onboarding' | 'home' | 'settings' | 'history' | 'chat' | 'coverLetterDetail';

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s);
      setApiKey(s.apiKey);
      setScreen(s.onboardingDone ? 'home' : 'onboarding');
      setLoaded(true);
    });
  }, []);

  const themeMode: ThemeMode = settings?.themeMode || 'light';
  const colors: Colors = getColors(themeMode);

  useEffect(() => {
    const root = document.documentElement;
    const c = colors;
    Object.entries(c).forEach(([key, val]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, val);
    });
    document.body.style.background = c.bg;
    document.body.style.color = c.textPrimary;
  }, [colors]);

  const handleSettingsChange = (s: AppSettings) => {
    setApiKey(s.apiKey);
    setSettings(s);
  };

  if (!loaded) {
    return (
      <div style={{height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9FC', color: '#767683', fontFamily: 'system-ui'}}>
        Loading...
      </div>
    );
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen
      settings={settings!}
      themeMode={themeMode}
      colors={colors}
      onDone={() => {
        loadSettings().then(s => {
          setSettings(s);
          setScreen('home');
        });
      }}
    />;
  }

  const commonProps = {colors, themeMode, settings: settings!};

  switch (screen) {
    case 'home':
      return <HomeScreen
        {...commonProps}
        onNavigate={setScreen}
        onSettingsChange={handleSettingsChange}
      />;
    case 'settings':
      return <SettingsScreen
        {...commonProps}
        onBack={() => setScreen('home')}
        onSettingsChange={handleSettingsChange}
      />;
    case 'history':
      return <HistoryScreen
        {...commonProps}
        onBack={() => setScreen('home')}
        onViewLetter={(l) => { setSelectedLetter(l); setScreen('coverLetterDetail'); }}
      />;
    case 'chat':
      return <ChatScreen
        {...commonProps}
        onBack={() => setScreen('home')}
      />;
    case 'coverLetterDetail':
      return <CoverLetterDetailScreen
        {...commonProps}
        letter={selectedLetter!}
        onBack={() => setScreen('history')}
        onSettingsChange={handleSettingsChange}
      />;
    default:
      return null;
  }
}
