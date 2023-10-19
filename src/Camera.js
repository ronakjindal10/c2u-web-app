// This is the Camera component that handles the camera access and selfie taking
import React, { useRef, useState } from "react";
import Webcam from "react-webcam"; // This is a third-party library that provides a webcam component

function Camera({ onSelfie, onError }) {
  const webcamRef = useRef(null); // This is a reference to the webcam element
  const [cameraError, setCameraError] = useState(null); // This state stores any camera error message

  // This is a helper function that converts a base64 string to a file object
  const base64ToFile = (base64, type, name) => {
    const byteString = atob(base64.split(",")[1]); // Decode the base64 string
    const ab = new ArrayBuffer(byteString.length); // Create an array buffer
    const ia = new Uint8Array(ab); // Create a uint8 array
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i); // Copy the bytes to the array buffer
    }
    return new File([ab], name, { type: type }); // Return a file object with the specified type and name
  };

  // This function handles the click event on the capture button
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot(); // Get the screenshot from the webcam element as a base64 string
    const file = base64ToFile(imageSrc, "image/jpeg", "selfie.jpg"); // Convert the base64 string to a file object with type "image/jpeg" and name "selfie.jpg"
    onSelfie(file); // Call the onSelfie prop function with the file as an argument
  };

  // This function handles the error event on the webcam element
  const handleError = (err) => {
    setCameraError(err.message); // Set the cameraError state to the error message
    onError(err.message); // Call the onError prop function with the error message as an argument
  };

  return (
    <div className="Camera">
      <Webcam
        audio={false} // Disable audio capture
        ref={webcamRef} // Set the reference to the webcam element
        screenshotFormat="image/jpeg" // Set the screenshot format to JPEG
        videoConstraints={{
          facingMode: "user", // Use the user-facing camera
        }} // Set the video constraints
        onError={handleError} // Set the error handler function
      />
      {cameraError && <p className="error">{cameraError}</p>} {/* If cameraError is not null, show it as a paragraph element with class name "error"*/}
      <button onClick={capture}>Capture</button> {/*Show a button element with click handler function as capture*/}
    </div>
  );
}

export default Camera;