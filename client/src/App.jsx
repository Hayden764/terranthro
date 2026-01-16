import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import { LayerProvider } from './context/LayerContext';
import { useMapContext } from './context/MapContext';
// D3 components (kept as backup)
// import NationalMap from './components/Map/NationalMap';
// import StateMap from './components/Map/StateMap';
// Mapbox components (active)
import MapboxNationalMap from './components/Map/MapboxNationalMap';
import AVAMap from './components/Map/AVAMap';
import Breadcrumb from './components/Navigation/Breadcrumb';
import LayersMenuButton from './components/UI/LayersMenuButton';
import LayersModal from './components/Layers/LayersModal';
import ProjectionInfoModal from './components/UI/ProjectionInfoModal';
import About from './pages/About';
import StatePage from './pages/StatePage';
import AVAPage from './components/AVAPage/AVAPage';
import './styles/globals.css';

function MapContainer() {
  const { currentLevel } = useMapContext();
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  const renderMap = () => {
    switch (currentLevel) {
      case 'national':
        return <MapboxNationalMap />;
      case 'ava':
        return <AVAMap />;
      default:
        return <MapboxNationalMap />;
    }
  };

  return (
    <div className="map-container">
      {renderMap()}
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
