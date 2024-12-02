import { Injectable } from '@angular/core';

/**
 * Service handle upload operations
 */
@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly MAX_SIZE = 5 * 1024 * 1024;

  /**
   * Asynchronously loads an image file and returns its data URL as a string.
   *
   * @param {File} file - The image file to be loaded.
   * @returns {Promise<string>} A promise that resolves with the data URL of the loaded image, or rejects with an error if the file is not an image or if loading fails.
   * @throws {Error} If the file type is not supported or if the image fails to load.
   */
  async loadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.match(/image.*/)) {
        reject(new Error('File type not supported. Please upload an image.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to load image'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validates the provided image file.
   *
   * This method checks if the file size is within the allowed limit of 5MB
   * and if the file type is one of the supported types (JPEG, PNG).
   *
   * @param file - The image file to be validated.
   * @returns `true` if the file is valid.
   * @throws {Error} If the file size exceeds 5MB.
   * @throws {Error} If the file type is not supported.
   */
  validateImage(file: File): boolean {
    if (file.size > this.MAX_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please upload a JPEG, PNG, or GIF');
    }

    return true;
  }
}
