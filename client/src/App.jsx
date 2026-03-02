import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import { LayerProvider } from './context/LayerContext';
import MapLibreNationalMap from './components/maps/MapLibreNationalMap';
import Breadcrumb from './components/navigation/Breadcrumb';
import LayersMenuButton from './components/ui/LayersMenuButton';
import LayersModal from './components/layers/LayersModal';
import ProjectionInfoModal from './components/ui/ProjectionInfoModal';
import About from './pages/About';
import StatePage from './pages/StatePage';
import AVAPage from './pages/AVAPage';
import './styles/globals.css';

/**
 * Home Page Component
 * Displays the national globe view with state selection
 */
function HomePage() {
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  return (
    <div className="App">
      <div className="map-container">
        <MapLibreNationalMap />
        <Breadcrumb />
        <LayersMenuButton onClick={() => setIsLayersOpen(true)} />
        <LayersModal 
          isOpen={isLayersOpen}
          onClose={() => setIsLayersOpen(false)}
        />
        <ProjectionInfoModal />
      </div>
    </div>
  );
}

/**
 * Root App Component
 * Wraps entire application with context providers
 */
function App() {
  return (
    <BrowserRouter>
      {/* 
        CRITICAL: Providers wrap ALL routes so every page can access context
        Previously, providers only wrapped home route - this caused StatePage/AVAPage
        to be unable to use MapContext/LayerContext
      */}
      <MapProvider>
        <LayerProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/states/:stateName" element={<StatePage />} />
            <Route path="/states/:stateName/avas/:avaSlug" element={<AVAPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </LayerProvider>
      </MapProvider>
    </BrowserRouter>
  );
}

export default App;
