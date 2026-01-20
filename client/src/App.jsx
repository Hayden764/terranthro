import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import { LayerProvider } from './context/LayerContext';
import { useMapContext } from './context/MapContext';
import MapLibreNationalMap from './components/Map/MapLibreNationalMap';
import Breadcrumb from './components/Navigation/Breadcrumb';
import LayersMenuButton from './components/UI/LayersMenuButton';
import LayersModal from './components/Layers/LayersModal';
import ProjectionInfoModal from './components/UI/ProjectionInfoModal';
import About from './pages/About';
import StatePage from './pages/StatePage';
import AVAPage from './pages/AVAPage';
import './styles/globals.css';

function MapContainer() {
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  return (
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MapProvider>
            <LayerProvider>
              <div className="App">
                <MapContainer />
              </div>
            </LayerProvider>
          </MapProvider>
        } />
        <Route path="/states/:stateName" element={<StatePage />} />
        <Route path="/states/:stateName/avas/:avaSlug" element={<AVAPage />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
