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
 * Interface representing gender count.
 */
export interface GenderCount {
  female: number;
  male: number;
}

/**
 * Interface representing the application state.
 */
export interface AppState {
  isStreaming: boolean;
  imageUrl: string | null;
  detectionStatus: DetectionStatus | null;
  genderCount: GenderCount;
}

/**
 * Initial state of the application.
 */
export const initialAppState: AppState = {
  isStreaming: false,
  imageUrl: null,
  detectionStatus: null,
  genderCount: { female: 0, male: 0 },
};
