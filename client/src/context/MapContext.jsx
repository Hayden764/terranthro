import { createContext, useContext, useReducer } from 'react';

const MapContext = createContext();

const initialState = {
  currentLevel: 'national', // 'national', 'state', 'ava'
  selectedState: null,
  selectedAVA: null,
  viewBounds: null,
  isTransitioning: false
};

function mapReducer(state, action) {
  switch (action.type) {
    case 'SET_LEVEL':
      return { 
        ...state, 
        currentLevel: action.payload,
        isTransitioning: false 
      };
    case 'SET_SELECTED_STATE':
      return { 
        ...state, 
        selectedState: action.payload 
      };
    case 'SET_SELECTED_AVA':
      return { 
        ...state, 
        selectedAVA: action.payload 
      };
    case 'SET_VIEW_BOUNDS':
      return { 
        ...state, 
        viewBounds: action.payload 
      };
    case 'SET_TRANSITIONING':
      return { 
        ...state, 
        isTransitioning: action.payload 
      };
    case 'NAVIGATE_TO_STATE':
      return {
        ...state,
        currentLevel: 'state',
        selectedState: action.payload,
        selectedAVA: null,
        isTransitioning: true
      };
    case 'NAVIGATE_TO_AVA':
      return {
        ...state,
        currentLevel: 'ava',
        selectedAVA: action.payload,
        isTransitioning: true
      };
    case 'NAVIGATE_TO_NATIONAL':
      return {
        ...state,
        currentLevel: 'national',
        selectedState: null,
        selectedAVA: null,
        isTransitioning: true
      };
    default:
      return state;
  }
}

export function MapProvider({ children }) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const actions = {
    setCurrentLevel: (level) => dispatch({ type: 'SET_LEVEL', payload: level }),
    setSelectedState: (state) => dispatch({ type: 'SET_SELECTED_STATE', payload: state }),
    setSelectedAVA: (ava) => dispatch({ type: 'SET_SELECTED_AVA', payload: ava }),
    setViewBounds: (bounds) => dispatch({ type: 'SET_VIEW_BOUNDS', payload: bounds }),
    setTransitioning: (transitioning) => dispatch({ type: 'SET_TRANSITIONING', payload: transitioning }),
    navigateToState: (state) => dispatch({ type: 'NAVIGATE_TO_STATE', payload: state }),
    navigateToAVA: (ava) => dispatch({ type: 'NAVIGATE_TO_AVA', payload: ava }),
    navigateToNational: () => dispatch({ type: 'NAVIGATE_TO_NATIONAL' })
  };

  return (
    <MapContext.Provider value={{ ...state, ...actions }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}
