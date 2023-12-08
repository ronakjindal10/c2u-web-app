import React from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

function Camera({ onCapture, setLoading }) {
    const webcamRef = React.useRef(null);
  
    // Helper function to convert base64 to File
    const base64ToFile = (base64, type, name) => {
      const byteString = atob(base64.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new File([ab], name, { type: type });
    };
  
    const capture = React.useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      const file = base64ToFile(imageSrc, "image/jpeg", "selfie.jpg");
      onCapture(file); // Pass the file object to the parent component
      setLoading(true); // Set loading to true to show loading screen
    }, [webcamRef, onCapture, setLoading]);

  return (
    <div>
      <Webcam
        audio={false}
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1280}
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>Capture Selfie</button>
    </div>
  );
}

export default Camera;