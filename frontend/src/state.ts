import { Reducer } from 'react';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  url?: string;
}

export interface Summary {
  id: string;
  title: string;
  created_at?: string;
  timestamp?: string;
  url: string;
  summary: string;
  messages?: Message[];
}

export interface AppState {
  summaries: Summary[];
  currentSummary: Summary | null;
  sidebarOpen: boolean;
  chatKey: number;
}

export type AppAction =
  | { type: 'SET_SUMMARIES'; payload: Summary[] }
  | { type: 'SET_CURRENT_SUMMARY'; payload: Summary | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'NEW_CHAT' };

export const initialState: AppState = {
  summaries: [],
  currentSummary: null,
  sidebarOpen: true,
  chatKey: Date.now(),
};

export const appReducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case 'SET_SUMMARIES':
      return { ...state, summaries: action.payload };
    case 'SET_CURRENT_SUMMARY':
      return { ...state, currentSummary: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'NEW_CHAT':
      return { ...state, currentSummary: null, chatKey: Date.now() };
    default:
      return state;
  }
};
