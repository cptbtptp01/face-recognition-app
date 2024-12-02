import { Injectable } from '@angular/core';

/**
 * Service handle webcam operations
 */
@Injectable({
  providedIn: 'root',
})
export class WebcamService {
  private stream: MediaStream | null = null;

  /**
   * Starts the webcam and streams the video to the provided HTMLVideoElement.
   *
   * @param video - The HTMLVideoElement where the webcam stream will be displayed.
   * @param width - The ideal width of the video stream.
   * @param height - The ideal height of the video stream.
   * @returns A promise that resolves to the MediaStream if successful, or null if there was an error or if getUserMedia is not supported.
   *
   * @throws Will log an error to the console if there is an issue accessing the webcam.
   */
  async startWebcam(
    video: HTMLVideoElement,
    width: number,
    height: number
  ): Promise<MediaStream | null> {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const constraints = {
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: 'user',
          },
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = this.stream;
        await video.play();
        return this.stream;
      } catch (error) {
        console.error('Error accessing webcam:', error);
        return null;
      }
    } else {
      console.error('getUserMedia not supported in this browser.');
      return null;
    }
  }

  /**
   * Stops the webcam stream and clears the video element's source object.
   *
   * @param videoElement - The HTMLVideoElement that is displaying the webcam stream.
   */
  stopWebcam(videoElement: HTMLVideoElement): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      videoElement.srcObject = null;
    }
  }
}
