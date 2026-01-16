import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Itinerary } from '../types';
import StorageService from '../services/StorageService';
import ItineraryService from '../services/ItineraryService';
import FileService from '../services/FileService';

interface ItineraryState {
  itineraries: Itinerary[];
  loading: boolean;
  error: string | null;
  notification: { message: string; type: 'success' | 'error' } | null;
}

type ItineraryAction =
  | { type: 'SET_ITINERARIES'; payload: Itinerary[] }
  | { type: 'ADD_ITINERARY'; payload: Itinerary }
  | { type: 'UPDATE_ITINERARY'; payload: Itinerary }
  | { type: 'DELETE_ITINERARY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' } | null };

interface ItineraryContextType {
  state: ItineraryState;
  addItinerary: (itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItinerary: (id: string, itinerary: Partial<Itinerary>) => void;
  deleteItinerary: (id: string) => void;
  getItinerary: (id: string) => Itinerary | undefined;
  exportItinerary: (id: string) => void;
  importItinerary: (file: File) => Promise<void>;
  clearNotification: () => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

const itineraryReducer = (state: ItineraryState, action: ItineraryAction): ItineraryState => {
  switch (action.type) {
    case 'SET_ITINERARIES':
      return { ...state, itineraries: action.payload, loading: false };
    case 'ADD_ITINERARY':
      return { ...state, itineraries: [...state.itineraries, action.payload] };
    case 'UPDATE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.filter(item => item.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    default:
      return state;
  }
};

export const ItineraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(itineraryReducer, {
    itineraries: [],
    loading: true,
    error: null,
    notification: null,
  });

  useEffect(() => {
    try {
      const itineraries = StorageService.getAllItineraries();
      dispatch({ type: 'SET_ITINERARIES', payload: itineraries });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'データの読み込みに失敗しました';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
      dispatch({ type: 'SET_ITINERARIES', payload: [] });
    }
  }, []);

  const addItinerary = (data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItinerary = ItineraryService.createItinerary(data);
      StorageService.saveItinerary(newItinerary);
      dispatch({ type: 'ADD_ITINERARY', payload: newItinerary });
      dispatch({ type: 'SET_NOTIFICATION', payload: { message: '行程表を保存しました', type: 'success' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存に失敗しました';
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const updateItinerary = (id: string, updates: Partial<Itinerary>) => {
    try {
      const existing = StorageService.getItinerary(id);
      if (!existing) {
        throw new Error('行程表が見つかりません');
      }
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      StorageService.saveItinerary(updated);
      dispatch({ type: 'UPDATE_ITINERARY', payload: updated });
      dispatch({ type: 'SET_NOTIFICATION', payload: { message: '行程表を更新しました', type: 'success' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新に失敗しました';
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const deleteItinerary = (id: string) => {
    try {
      StorageService.deleteItinerary(id);
      dispatch({ type: 'DELETE_ITINERARY', payload: id });
      dispatch({ type: 'SET_NOTIFICATION', payload: { message: '行程表を削除しました', type: 'success' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : '削除に失敗しました';
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const getItinerary = (id: string): Itinerary | undefined => {
    return state.itineraries.find(item => item.id === id);
  };

  const exportItinerary = (id: string) => {
    try {
      const itinerary = getItinerary(id);
      if (!itinerary) {
        throw new Error('行程表が見つかりません');
      }
      FileService.exportToJSON(itinerary);
      dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'エクスポートしました', type: 'success' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'エクスポートに失敗しました';
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const importItinerary = async (file: File) => {
    try {
      const itinerary = await FileService.importFromJSON(file);
      StorageService.saveItinerary(itinerary);
      dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
      dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'インポートしました', type: 'success' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'インポートに失敗しました';
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const clearNotification = () => {
    dispatch({ type: 'SET_NOTIFICATION', payload: null });
  };

  return (
    <ItineraryContext.Provider
      value={{
        state,
        addItinerary,
        updateItinerary,
        deleteItinerary,
        getItinerary,
        exportItinerary,
        importItinerary,
        clearNotification,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = (): ItineraryContextType => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within ItineraryProvider');
  }
  return context;
};
