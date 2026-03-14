import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import { LayerProvider } from './context/LayerContext';
import MapLibreNationalMap from './components/maps/MapLibreNationalMap';
import LayersMenuButton from './components/ui/LayersMenuButton';
import LayersModal from './components/layers/LayersModal';
import WelcomeModal from './components/ui/WelcomeModal';
import About from './pages/About';
import StatePage from './pages/StatePage';
import AVAPage from './pages/AVAPage';
import './styles/globals.css';

/**
 * Home Page Component
 * Displays the national globe view with state selection
 */
function HomePage({ welcomeDone, onWelcomeDone }) {
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  return (
    <div className="App">
      <div className="map-container">
        <MapLibreNationalMap />
        <LayersMenuButton onClick={() => setIsLayersOpen(true)} />
        <LayersModal 
          isOpen={isLayersOpen}
          onClose={() => setIsLayersOpen(false)}
        />
        {!welcomeDone && <WelcomeModal onClose={onWelcomeDone} />}
      </div>
    </div>
  );
}

/**
 * Root App Component
 * Wraps entire application with context providers
 */
function App() {
  const [welcomeDone, setWelcomeDone] = useState(
    () => localStorage.getItem('terranthro_welcome_dismissed') === 'true'
  );

  return (
    <BrowserRouter>
      <MapProvider>
        <LayerProvider>
          <Routes>
            <Route path="/" element={<HomePage welcomeDone={welcomeDone} onWelcomeDone={() => setWelcomeDone(true)} />} />
            <Route path="/:stateName" element={<StatePage />} />
            <Route path="/:stateName/:avaSlug" element={<AVAPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </LayerProvider>
      </MapProvider>
    </BrowserRouter>
  );
}

export default App;
