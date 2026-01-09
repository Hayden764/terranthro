import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import { LayerProvider } from './context/LayerContext';
import { useMapContext } from './context/MapContext';
import NationalMap from './components/Map/NationalMap';
import StateMap from './components/Map/StateMap';
import AVAMap from './components/Map/AVAMap';
import Breadcrumb from './components/Navigation/Breadcrumb';
import LayersMenuButton from './components/UI/LayersMenuButton';
import LayersModal from './components/Layers/LayersModal';
import ProjectionInfoModal from './components/UI/ProjectionInfoModal';
import About from './pages/About';
import './styles/globals.css';

function MapContainer() {
  const { currentLevel } = useMapContext();
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  const renderMap = () => {
    switch (currentLevel) {
      case 'national':
        return <NationalMap />;
      case 'state':
        return <StateMap />;
      case 'ava':
        return <AVAMap />;
      default:
        return <NationalMap />;
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
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
