/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import FileService from '../services/FileService';
import ItineraryService from '../services/ItineraryService';
import StorageService from '../services/StorageService';
import type { Itinerary } from '../types';
import { useAuth } from './AuthContext';

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
  addItinerary: (itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItinerary: (id: string, itinerary: Partial<Itinerary>) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  getItinerary: (id: string) => Itinerary | undefined;
  exportItinerary: (id: string) => void;
  exportItineraryAsMarkdown: (id: string) => void;
  importItinerary: (file: File) => Promise<void>;
  importFromMarkdown: (file: File) => Promise<void>;
  downloadTemplate: () => void;
  clearNotification: () => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

const reducer = (state: ItineraryState, action: ItineraryAction): ItineraryState => {
  switch (action.type) {
    case 'SET_ITINERARIES':
      return { ...state, itineraries: action.payload, loading: false };
    case 'ADD_ITINERARY':
      return { ...state, itineraries: [...state.itineraries, action.payload] };
    case 'UPDATE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case 'DELETE_ITINERARY':
      return {
        ...state,
        itineraries: state.itineraries.filter((item) => item.id !== action.payload),
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

const fallbackMessage = (message: string) => message;

export const ItineraryProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    itineraries: [],
    loading: true,
    error: null,
    notification: null,
  });

  useEffect(() => {
    const loadItineraries = async () => {
      if (!currentUser) {
        dispatch({ type: 'SET_ITINERARIES', payload: [] });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const itineraries = await StorageService.getAllItineraries(currentUser.uid);
        dispatch({ type: 'SET_ITINERARIES', payload: itineraries });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : fallbackMessage('旅ノートの読み込みに失敗しました。');
        dispatch({ type: 'SET_ERROR', payload: message });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
        dispatch({ type: 'SET_ITINERARIES', payload: [] });
      }
    };

    void loadItineraries();
  }, [currentUser]);

  const ensureCurrentUser = () => {
    if (!currentUser) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: 'ログイン後にご利用ください。', type: 'error' },
      });
      return false;
    }

    return true;
  };

  const addItinerary = async (data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!ensureCurrentUser()) {
      return;
    }

    try {
      const itinerary = ItineraryService.createItinerary({
        ...data,
        coverImage: data.coverImage || '',
      });
      await StorageService.saveItinerary(itinerary, currentUser!.uid);
      dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: '旅ノートを保存しました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('旅ノートの保存に失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const updateItinerary = async (id: string, updates: Partial<Itinerary>) => {
    if (!ensureCurrentUser()) {
      return;
    }

    try {
      const existing = await StorageService.getItinerary(id, currentUser!.uid);
      if (!existing) {
        throw new Error('旅ノートが見つかりません。');
      }

      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      await StorageService.saveItinerary(updated, currentUser!.uid);
      dispatch({ type: 'UPDATE_ITINERARY', payload: updated });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: '旅ノートを更新しました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('旅ノートの更新に失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const deleteItinerary = async (id: string) => {
    if (!ensureCurrentUser()) {
      return;
    }

    try {
      await StorageService.deleteItinerary(id, currentUser!.uid);
      dispatch({ type: 'DELETE_ITINERARY', payload: id });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: '旅ノートを削除しました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('旅ノートの削除に失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const getItinerary = (id: string) => state.itineraries.find((item) => item.id === id);

  const exportItinerary = (id: string) => {
    try {
      const itinerary = getItinerary(id);
      if (!itinerary) {
        throw new Error('旅ノートが見つかりません。');
      }
      FileService.exportToJSON(itinerary);
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: 'JSONファイルを書き出しました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('書き出しに失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const exportItineraryAsMarkdown = (id: string) => {
    try {
      const itinerary = getItinerary(id);
      if (!itinerary) {
        throw new Error('旅ノートが見つかりません。');
      }
      FileService.exportToMarkdown(itinerary);
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: 'Markdownを書き出しました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('書き出しに失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const importItinerary = async (file: File) => {
    if (!ensureCurrentUser()) {
      return;
    }

    try {
      const itinerary = await FileService.importFromJSON(file);
      await StorageService.saveItinerary(itinerary, currentUser!.uid);
      dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: 'JSONファイルを取り込みました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('取り込みに失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const importFromMarkdown = async (file: File) => {
    if (!ensureCurrentUser()) {
      return;
    }

    try {
      const itinerary = await FileService.importFromMarkdown(file);
      await StorageService.saveItinerary(itinerary, currentUser!.uid);
      dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: 'Markdownを取り込みました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('Markdownの取り込みに失敗しました。');
      dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'error' } });
    }
  };

  const downloadTemplate = () => {
    try {
      FileService.downloadTemplate();
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: { message: 'テンプレートを保存しました。', type: 'success' },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : fallbackMessage('テンプレートの保存に失敗しました。');
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
        exportItineraryAsMarkdown,
        importItinerary,
        importFromMarkdown,
        downloadTemplate,
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
