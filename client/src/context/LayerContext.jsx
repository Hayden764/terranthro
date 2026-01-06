import { createContext, useContext, useReducer } from 'react';

const LayerContext = createContext();

const initialState = {
  activeLayers: [],
  layerOpacity: {},
  availableLayers: [],
  layerData: {},
  isLoading: false
};

function layerReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_LAYER':
      const layerId = action.payload;
      const isActive = state.activeLayers.includes(layerId);
      return {
        ...state,
        activeLayers: isActive 
          ? state.activeLayers.filter(id => id !== layerId)
          : [...state.activeLayers, layerId]
      };
    case 'SET_LAYER_OPACITY':
      return {
        ...state,
        layerOpacity: {
          ...state.layerOpacity,
          [action.payload.layerId]: action.payload.opacity
        }
      };
    case 'SET_AVAILABLE_LAYERS':
      return {
        ...state,
        availableLayers: action.payload
      };
    case 'SET_LAYER_DATA':
      return {
        ...state,
        layerData: {
          ...state.layerData,
          [action.payload.layerId]: action.payload.data
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'CLEAR_LAYERS':
      return {
        ...state,
        activeLayers: [],
        layerData: {}
      };
    default:
      return state;
  }
}

export function LayerProvider({ children }) {
  const [state, dispatch] = useReducer(layerReducer, initialState);

  const actions = {
    toggleLayer: (layerId) => dispatch({ type: 'TOGGLE_LAYER', payload: layerId }),
    setLayerOpacity: (layerId, opacity) => 
      dispatch({ type: 'SET_LAYER_OPACITY', payload: { layerId, opacity } }),
    setAvailableLayers: (layers) => 
      dispatch({ type: 'SET_AVAILABLE_LAYERS', payload: layers }),
    setLayerData: (layerId, data) => 
      dispatch({ type: 'SET_LAYER_DATA', payload: { layerId, data } }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    clearLayers: () => dispatch({ type: 'CLEAR_LAYERS' })
  };

  return (
    <LayerContext.Provider value={{ ...state, ...actions }}>
      {children}
    </LayerContext.Provider>
  );
}

export function useLayerContext() {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayerContext must be used within a LayerProvider');
  }
  return context;
}
