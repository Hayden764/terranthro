import { MapProvider } from './context/MapContext';
import { LayerProvider } from './context/LayerContext';
import { useMapContext } from './context/MapContext';
import NationalMap from './components/Map/NationalMap';
import StateMap from './components/Map/StateMap';
import AVAMap from './components/Map/AVAMap';
import Breadcrumb from './components/Navigation/Breadcrumb';
import LayerPanel from './components/Layers/LayerPanel';
import './styles/globals.css';

function MapContainer() {
  const { currentLevel } = useMapContext();

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
      <LayerPanel />
    </div>
  );
}

function App() {
  return (
    <MapProvider>
      <LayerProvider>
        <div className="App">
          <MapContainer />
        </div>
      </LayerProvider>
    </MapProvider>
  );
}

export default App;
