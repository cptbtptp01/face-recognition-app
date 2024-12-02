import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Dimensions } from '../../models/feed.model';
import { WebcamService } from '../../../../core/services/webcam.service';
import { RecognitionService } from '../../../../core/services/recognition.service';
import { UploadService } from '../../../../core/services/upload.service';
import { Store } from '@ngrx/store';
import {
  selectDetectionStatus,
  selectImageUrl,
  selectIsStreaming,
} from '../../../../core/store/selectors/app.selectors';
import { first, Observable } from 'rxjs';
import * as AppActions from '../../../../core/store/actions/app.actions';
import { DetectionStatus } from '../../../../core/store/state/app.state';

/**
 * Manage source (video, image), perform face detection.
 */
@Component({
  selector: 'app-feed',
  imports: [CommonModule],
  templateUrl: './feed.component.html',
  styleUrl: './scss/feed.component.scss',
})
export class FeedComponent implements OnInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlay') public overlay!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('image') image!: ElementRef<HTMLImageElement>;

  readonly dimensions: Dimensions = {
    width: 640,
    height: 480,
  };

  isStreaming$: Observable<boolean>;
  imageUrl$: Observable<string | null>;
  detectionStatus$: Observable<DetectionStatus | null>;

  constructor(
    private store: Store,
    private webcamService: WebcamService,
    private uploadService: UploadService,
    private recognitionService: RecognitionService
  ) {
    this.isStreaming$ = this.store.select(selectIsStreaming);
    this.imageUrl$ = this.store.select(selectImageUrl);
    this.detectionStatus$ = this.store.select(selectDetectionStatus);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.recognitionService.loadModels();
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
    }
  }

  async toggleWebcam(): Promise<void> {
    this.isStreaming$.pipe(first()).subscribe(isStreaming => {
      if (isStreaming) {
        this.stopWebcam();
      } else {
        this.startWebcam();
      }
    });
  }

  /**
   * Starts the webcam and initializes face detection.
   *
   * @returns {Promise<void>} A promise that resolves when the webcam has started.
   * @throws Will log an error to the console if starting the webcam fails.
   */
  async startWebcam(): Promise<void> {
    this.store.dispatch(AppActions.setImageUrl({ imageUrl: null }));
    if (this.image?.nativeElement) {
      this.image.nativeElement.src = '';
    }

    try {
      const stream = await this.webcamService.startWebcam(
        this.video.nativeElement,
        this.dimensions.width,
        this.dimensions.height
      );

      if (stream) {
        this.store.dispatch(AppActions.startWebcam());
        this.recognitionService.startFaceDetection(
          this.video.nativeElement,
          this.overlay.nativeElement
        );
      }
    } catch (error) {
      console.error('Error starting webcam:', error);
    }
  }

  /**
   * Stops the webcam feed and performs necessary cleanup actions.
   *
   * @returns {void}
   */
  stopWebcam(): void {
    this.webcamService.stopWebcam(this.video.nativeElement);
    this.store.dispatch(AppActions.stopWebcam());
    this.recognitionService.stopFaceDetection();
    this.clearOverlay();
  }

  /**
   * Clears the overlay by resetting the canvas context.
   *
   * @private
   */
  private clearOverlay(): void {
    const overlayElement = this.overlay.nativeElement;
    const context = overlayElement.getContext('2d');
    if (context) {
      context.clearRect(0, 0, overlayElement.width, overlayElement.height);
    }
  }

  /**
   * Triggers a click event on the file input element.
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handles the image load event and initiates static face detection.
   *
   * @param event - The event triggered when the image is loaded.
   */
  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && this.overlay) {
      this.recognitionService.startStaticFaceDetection(img, this.overlay.nativeElement);
    }
  }

  /**
   * Handles the file selection event, validates and uploads the selected image file.
   * If the image is successfully uploaded, it updates the image URL in the store and sets the image source.
   * If the webcam is streaming, it stops the webcam.
   * In case of an error during the upload process, it logs the error and updates the detection status in the store.
   *
   * @param {Event} event - The file selection event triggered by the input element.
   * @returns {Promise<void>} A promise that resolves when the file processing is complete.
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      this.uploadService.validateImage(file);
      const imageUrl = await this.uploadService.loadImage(file);
      this.store.dispatch(AppActions.setImageUrl({ imageUrl }));
      this.image.nativeElement.src = imageUrl;

      this.isStreaming$.pipe(first()).subscribe(isStreaming => {
        if (isStreaming) {
          this.stopWebcam();
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      this.store.dispatch(
        AppActions.setDetectionStatus({
          status: {
            success: false,
            message: 'Failed to upload image',
            timestamp: Date.now(),
          },
        })
      );
    }
  }

  /**
   * Clears the current image and resets the input fields and overlay.
   *
   * @returns {void}
   */
  clearImage(): void {
    this.store.dispatch(AppActions.setImageUrl({ imageUrl: null }));
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    if (this.image?.nativeElement) {
      this.image.nativeElement.src = '';
    }

    this.clearOverlay();
    this.store.dispatch(AppActions.clearDetectionStatus());
  }

  ngOnDestroy(): void {
    this.stopWebcam();
    this.store.dispatch(AppActions.clearDetectionStatus());
  }
}
