import { configureStore, createReducer } from '@reduxjs/toolkit'
import settings, { SettingsState } from './reducers/settings'

export interface State {
    settings: SettingsState;
};

const loadState = () => {
    const state = localStorage.getItem('state');
    if (state === null) {
        return undefined;
    }
    try {
        return JSON.parse(state);
    } catch(e) {
        return undefined;
    }
};

const store = configureStore<State>({
    reducer: {
      settings,
      
    },
    preloadedState: loadState()
});

store.subscribe(() => {
    const state = JSON.stringify(store.getState());
    localStorage.setItem('state', state);
});

export default store;