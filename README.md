# Face Recognition App

This is a web application to perform real-time face detection and analysis on both video streams (from the user's webcam) and image uploads.

## Key Features:

- **Face Detection**: The application can detect faces in both video and image input, and display bounding boxes around the detected faces.
- **Facial Expression Recognition**: The application can recognize the dominant facial expression (e.g., happy, sad, angry) for each detected face and display the expression information.
- **Age and Gender Estimation**: The application can estimate the age and gender of each detected face and display this information.
- **Image Upload**: Users can upload images to the application and have them analyzed for face detection and analysis.

## Tech Stack

The application is built using the following technologies:

- **Angular**
- **TypeScript**
- **TensorFlow.js**
- **face-api.js**
- **NgRx**
- **BootStrap**

## Getting Started

To run the application locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/cptbtptp01/face-recognition-app.git
   ```

2. Navigate to the project directory:

   ```
   cd face-recognition-app
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Start the server:

   ```
   ng build --configuration production
   npm start
   ```

5. Open your web browser and navigate to `http://localhost:8080/` to see the application.

## Usage

When the application is running, you can:

1. Click the "Start Webcam" button to activate the webcam and start real-time face detection and analysis.
2. Upload an image by clicking the "Upload Image" button and selecting a file.
3. The application will display the detected faces, along with their facial expressions, age, and gender.
