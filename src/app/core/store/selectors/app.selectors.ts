import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../state/app.state';

/**
 * Selector to get the application state.
 */
export const selectAppState = createFeatureSelector<AppState>('app');
export const selectIsStreaming = createSelector(selectAppState, state => state.isStreaming);
export const selectIsModelLoaded = createSelector(
  selectAppState,
  state => state.detectionStatus?.isModelLoaded
);
export const selectImageUrl = createSelector(selectAppState, state => state.imageUrl);
export const selectDetectionStatus = createSelector(selectAppState, state => state.detectionStatus);
export const selectGenderCount = createSelector(selectAppState, state => state.genderCount);
