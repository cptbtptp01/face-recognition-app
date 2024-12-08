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
  on(AppActions.clearDetectionStatus, state => ({ ...state, detectionStatus: null })),
  on(AppActions.incrementGenderCount, (state, { gender }) => ({
    ...state,
    genderCount: {
      ...state.genderCount,
      [gender]: state.genderCount[gender] + 1,
    },
  })),

  on(AppActions.updateGenderCount, (state, { counts }) => ({
    ...state,
    genderCount: {
      female: counts.female,
      male: counts.male,
    },
  })),

  on(AppActions.resetGenderCount, state => ({
    ...state,
    genderCount: { female: 0, male: 0 },
  }))
);
