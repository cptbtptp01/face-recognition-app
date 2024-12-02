import { createReducer, on } from '@ngrx/store';
import * as AppActions from '../actions/app.actions';
import { initialAppState } from '../state/app.state';

/**
 * Reducer function for the application state
 */
export const appReducer = createReducer(
  initialAppState,
  on(AppActions.startWebcam, state => ({ ...state, isStreaming: true })),
  on(AppActions.stopWebcam, state => ({ ...state, isStreaming: false })),
  on(AppActions.setImageUrl, (state, { imageUrl }) => ({ ...state, imageUrl })),
  on(AppActions.setDetectionStatus, (state, { status }) => ({ ...state, detectionStatus: status })),
  on(AppActions.clearDetectionStatus, state => ({ ...state, detectionStatus: null }))
);
