/**
 * Interface representing the detection status of the facial recognition process.
 */
export interface DetectionStatus {
  success: boolean;
  message: string;
  timestamp: number;
  isModelLoaded?: boolean;
}

/**
 * Interface representing the application state.
 */
export interface AppState {
  isStreaming: boolean;
  imageUrl: string | null;
  detectionStatus: DetectionStatus | null;
}

/**
 * Initial state of the application.
 */
export const initialAppState: AppState = {
  isStreaming: false,
  imageUrl: null,
  detectionStatus: null,
};
