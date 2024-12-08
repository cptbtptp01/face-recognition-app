import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as faceapi from 'face-api.js';
import * as AppActions from '../store/actions/app.actions';
import { selectGenderCount } from '../store/selectors/app.selectors';
import { first } from 'rxjs';
import { GenderCount } from '../store/state/app.state';

/**
 * Service handle face detections
 */
@Injectable({
  providedIn: 'root',
})
export class RecognitionService {
  private modelsLoaded = false;
  private detectInterval: any;
  private readonly MIN_PROBABILITY = 0.05;
  private currentGenderCount: GenderCount = { female: 0, male: 0 };

  private readonly EXPRESSION_ORDER = [
    'neutral',
    'happy',
    'sad',
    'angry',
    'fearful',
    'disgusted',
    'surprised',
  ] as const;

  constructor(private store: Store) {
    this.store
      .select(selectGenderCount)
      .pipe(first())
      .subscribe(count => {
        this.currentGenderCount = { ...count };
      });
  }

  /**
   * Loads the face detection models if they are not already loaded.
   *
   * The models being loaded include:
   * - ssdMobilenetv1
   * - faceRecognitionNet
   * - ageGenderNet
   * - faceExpressionNet
   *
   * @returns {Promise<void>} A promise that resolves when the models are loaded.
   * @throws Will throw an error if the models fail to load.
   */
  async loadModels(): Promise<void> {
    if (!this.modelsLoaded) {
      const MODEL_URL = '/models';
      try {
        this.updateDetectionStatus(false, 'Loading face detection models...', false);
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        this.modelsLoaded = true;
        this.updateDetectionStatus(true, 'Models loaded successfully', true);
      } catch (error) {
        this.updateDetectionStatus(false, 'Failed to load face detection models', false);
        throw error;
      }
    }
  }

  /**
   * Starts the face detection process on a given video element and draws the detections on an overlay canvas.
   *
   * @param video - The HTMLVideoElement from which the face detection will be performed.
   * @param overlay - The HTMLCanvasElement on which the detections will be drawn.
   */
  startFaceDetection(video: HTMLVideoElement, overlay: HTMLCanvasElement) {
    const dims = this.setupCanvas(video, overlay);
    this.detectInterval = setInterval(async () => {
      await this.drawDetections(video, overlay, dims);
      // TODO draw data viz
    }, 500);
  }

  /**
   * Starts the static face detection process on a given image and draws the detections on an overlay canvas.
   *
   * @param {HTMLImageElement} image - The image element containing the face to be detected.
   * @param {HTMLCanvasElement} overlay - The canvas element where the detection results will be drawn.
   * @returns {Promise<void>} A promise that resolves when the face detection and drawing are complete.
   */
  async startStaticFaceDetection(image: HTMLImageElement, overlay: HTMLCanvasElement) {
    const dims = this.setupCanvas(image, overlay);
    await this.drawDetections(image, overlay, dims);
  }

  /**
   * Stops the face detection process by clearing the detection interval
   * and dispatching an action to clear the detection status in the store.
   *
   * @returns {void}
   */
  stopFaceDetection(): void {
    if (this.detectInterval) {
      clearInterval(this.detectInterval);
      this.detectInterval = null;
    }
    this.store.dispatch(AppActions.clearDetectionStatus());
    this.resetGenderTracking();
  }

  /**
   * Sets up the canvas dimensions to match the source element.
   *
   * @param source - The source element, which can be an HTMLVideoElement or HTMLImageElement.
   * @param overlay - The canvas element to be set up.
   * @returns An object containing the width and height of the source element.
   */
  private setupCanvas(source: HTMLVideoElement | HTMLImageElement, overlay: HTMLCanvasElement) {
    const width = source.width;
    const height = source.height;

    overlay.width = width;
    overlay.height = height;

    return { width, height };
  }

  /**
   * Detects faces, face expressions, age, and gender in the given video or image.
   *
   * @param {HTMLVideoElement | HTMLImageElement} source - The video or image element to detect faces from.
   * @returns {Promise<faceapi.DetectedFace[]>} A promise that resolves to an array of detected faces with expressions, age, and gender.
   * If no faces are detected, an empty array is returned.
   *
   * @throws Will log an error message to the console if face detection fails.
   */
  private async detectFaces(source: HTMLVideoElement | HTMLImageElement) {
    try {
      const detections = await faceapi
        .detectAllFaces(source)
        .withFaceExpressions()
        .withAgeAndGender();
      if (detections.length === 0) {
        this.updateDetectionStatus(false, 'No faces detected in the image', true);
        return [];
      }
      this.updateDetectionStatus(true, `Detected Face Count: ${detections.length}`, true);
      return detections;
    } catch (error) {
      this.updateDetectionStatus(false, 'Error during face detection', true);
      console.error('Face detection error:', error);
      return [];
    }
  }

  /**
   * Determines the dominant facial expression from a set of facial expressions.
   *
   * @param expressions - An object containing facial expressions and their corresponding probabilities.
   * @returns An object containing the dominant expression, its probability, and an array of expression values.
   */
  private getDominantExpression(expressions: faceapi.FaceExpressions): {
    expression: string;
    probability: number;
    expressionValues: number[];
  } {
    const dominantExpression = Object.entries(expressions).reduce((prev, curr) =>
      curr[1] > prev[1] ? curr : prev
    );

    const expressionValues = this.EXPRESSION_ORDER.map(exp =>
      exp === dominantExpression[0] ? dominantExpression[1] : 0
    );

    return {
      expression: dominantExpression[0],
      probability: dominantExpression[1],
      expressionValues,
    };
  }

  /**
   * Draws face detections and expressions on a given canvas overlay.
   *
   * @param source - The source element containing the image or video to detect faces from.
   * @param overlay - The canvas element on which to draw the detections and expressions.
   * @param dims - The dimensions of the source element.
   * @returns A promise that resolves when the detections have been drawn.
   */
  private async drawDetections(
    source: HTMLVideoElement | HTMLImageElement,
    overlay: HTMLCanvasElement,
    dims: { width: number; height: number }
  ) {
    const detections = await this.detectFaces(source);

    const sessionGenderCount = { ...this.currentGenderCount };

    const context = overlay.getContext('2d');
    if (context) {
      context.clearRect(0, 0, overlay.width, overlay.height);

      if (detections.length > 0) {
        // fit the source dimensions
        const resizedDetections = faceapi.resizeResults(detections, dims);

        // Draw each detection
        resizedDetections.forEach(detection => {
          const { age, gender, genderProbability, expressions } = detection;
          const { expression, probability } = this.getDominantExpression(expressions);

          faceapi.draw.drawDetections(overlay, detection);

          this.store.dispatch(AppActions.incrementGenderCount({ gender }));
          sessionGenderCount[gender]++;
          this.store.dispatch(
            AppActions.updateGenderCount({
              counts: { female: sessionGenderCount.female, male: sessionGenderCount.male },
            })
          );

          const text = [
            `${gender}_${sessionGenderCount[gender]} (${genderProbability.toFixed(2)})`,
            `Age: ${Math.round(age)} yrs`,
            `${expression} (${probability.toFixed(2)})`,
          ];
          const anchor = detection.detection.box.bottomLeft;
          const textOptions = {
            anchorPosition: faceapi.draw.AnchorPosition.TOP_LEFT,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          };
          const drawText = new faceapi.draw.DrawTextField(text, anchor, textOptions);
          drawText.draw(overlay);
        });
      }
    }
  }

  /**
   * Updates the detection status in the store.
   *
   * @private
   * @param {boolean} success - Indicates whether the detection was successful.
   * @param {string} message - A message describing the detection status.
   * @param {boolean} isModelLoaded - Indicates whether the model was loaded.
   * @returns {void}
   */
  private updateDetectionStatus(success: boolean, message: string, isModelLoaded?: boolean) {
    this.store.dispatch(
      AppActions.setDetectionStatus({
        status: {
          success,
          message,
          timestamp: Date.now(),
          isModelLoaded,
        },
      })
    );
  }
  /**
   * Reset gender tracking
   */
  private resetGenderTracking() {
    this.store.dispatch(AppActions.resetGenderCount());
    this.currentGenderCount = { female: 0, male: 0 };
  }
}
