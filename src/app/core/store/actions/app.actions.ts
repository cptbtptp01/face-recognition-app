import { createAction, props } from '@ngrx/store';
import { DetectionStatus } from '../state/app.state';

/**
 * Action creators
 */
export const startWebcam = createAction('[App] Start Webcam');
export const stopWebcam = createAction('[App] Stop Webcam');
export const setImageUrl = createAction(
  '[App] Set Image URL',
  props<{ imageUrl: string | null }>()
);

export const setDetectionStatus = createAction(
  '[App] Set Detection Status',
  props<{ status: DetectionStatus | null }>()
);

export const clearDetectionStatus = createAction('[App] Clear Detection Status');
