import React, {useState, useEffect, useMemo} from 'react';
import {AppData, DEFAULT_DATA} from '../types';
import {loadAppData} from './store/settings';
import {light, dark} from './theme';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import HistoryScreen from './screens/HistoryScreen';
import ChatScreen from './screens/ChatScreen';
import CoverLetterDetailScreen from './screens/CoverLetterDetailScreen';
import {CoverLetter} from '../types';

type Screen = 'home' | 'settings' | 'history' | 'chat' | 'coverLetterDetail';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAppData().then(d => {
      setData(d);
      setLoaded(true);
    });
  }, []);

  const colors = useMemo(() => data.theme === 'dark' ? dark : light, [data.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', colors.bg);
    document.documentElement.style.setProperty('--surface', colors.surface);
    document.documentElement.style.setProperty('--surface-elevated', colors.surfaceElevated);
    document.documentElement.style.setProperty('--text-primary', colors.textPrimary);
    document.documentElement.style.setProperty('--text-secondary', colors.textSecondary);
    document.documentElement.style.setProperty('--text-tertiary', colors.textTertiary);
    document.documentElement.style.setProperty('--accent', colors.accent);
    document.documentElement.style.setProperty('--accent-bg', colors.accentBg);
    document.documentElement.style.setProperty('--border', colors.border);
    document.documentElement.style.setProperty('--error', colors.error);
    document.documentElement.style.setProperty('--green', colors.green);
    document.documentElement.style.setProperty('--orange', colors.orange);
    document.documentElement.style.setProperty('--blue', colors.blue);
    document.documentElement.style.setProperty('--purple', colors.purple);
    document.body.style.background = colors.bg;
    document.body.style.color = colors.textPrimary;
  }, [colors]);

  if (!loaded) {
    return <div className="app-container" style={{alignItems: 'center', justifyContent: 'center', background: colors.bg}}>
      <div style={{color: colors.textTertiary}}>Loading...</div>
    </div>;
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen
          data={data}
          onNavigate={setScreen}
          onDataChange={setData}
        />;
      case 'settings':
        return <SettingsScreen
          data={data}
          onBack={() => setScreen('home')}
          onDataChange={setData}
        />;
      case 'history':
        return <HistoryScreen
          onBack={() => setScreen('home')}
          onViewLetter={(l) => { setSelectedLetter(l); setScreen('coverLetterDetail'); }}
        />;
      case 'chat':
        return <ChatScreen
          data={data}
          onBack={() => setScreen('home')}
          onDataChange={setData}
        />;
      case 'coverLetterDetail':
        return <CoverLetterDetailScreen
          letter={selectedLetter!}
          onBack={() => setScreen('history')}
          data={data}
          onDataChange={setData}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container" style={{background: colors.bg, color: colors.textPrimary}}>
      {renderScreen()}
    </div>
  );
}
