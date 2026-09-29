import { useState, useEffect } from 'react';
import { I18nProvider } from '@/i18n';
import {
  parseHash,
  navigateToHub,
  onRouteChange,
  type Route,
} from '@/lib/router';
import { Landing } from '@/components/Landing';
import { GamePage } from '@/components/GamePage';

function AppContent() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const unsub = onRouteChange((r) => setRoute(r));
    return unsub;
  }, []);

  if (route.name === 'game') {
    return <GamePage gameId={route.gameId} onBack={navigateToHub} />;
  }

  return (
    <Landing
      onOpenGame={(gameId) => {
        window.open(`${window.location.origin}${window.location.pathname}#/gamer/${gameId}`, '_blank');
      }}
    />
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
