import { useReducer } from 'react';

export const PHASE = {
  CHAT: 'CHAT',
  GRID: 'GRID',
  ITERATION: 'ITERATION',
  DONE: 'DONE',
};

const initialState = {
  phase: PHASE.CHAT,
  messages: [],
  sketchMode: '',
  song: '',
  weather: '',
  emotions: [],
  summary: '',
  sketches: [],
  selectedIndex: null,
  currentSketch: '',
  iteration: 1,
  feedbackHistory: [],
  isLoading: false,
  loadingLabel: '',
  progress: 0,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_SKETCH_MODE':
      return { ...state, sketchMode: action.payload };
    case 'SET_SONG':
      return { ...state, song: action.payload };
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    case 'SET_EMOTIONS':
      return { ...state, emotions: action.payload };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_SKETCHES':
      return { ...state, sketches: action.payload };
    case 'SELECT_SKETCH':
      return {
        ...state,
        selectedIndex: action.payload,
        currentSketch: state.sketches[action.payload],
        phase: PHASE.ITERATION,
        iteration: 1,
        feedbackHistory: [],
      };
    case 'SET_CURRENT_SKETCH':
      return { ...state, currentSketch: action.payload };
    case 'ADD_FEEDBACK':
      return {
        ...state,
        feedbackHistory: [...state.feedbackHistory, action.payload],
        iteration: state.iteration + 1,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, progress: action.payload ? state.progress : 0, loadingLabel: action.payload ? state.loadingLabel : '' };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload.progress, loadingLabel: action.payload.label ?? state.loadingLabel };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
