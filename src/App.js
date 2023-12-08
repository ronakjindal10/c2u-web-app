import React, { useState } from 'react';
import axios from 'axios';
import Camera from './Camera';
import PhotoGallery from './Gallery';
import './App.css'; // Assuming you have an App.css for styling

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showSelfie, setShowSelfie] = useState(true); // State to show/hide selfie camera
  const [loading, setLoading] = useState(false); // State to show/hide loading screen
  const [photos, setPhotos] = useState([]);

  const handleSelfieCapture = async (selfieFile) => {
    try {
      setLoading(true); // Start loading
      setShowSelfie(false); // Hide selfie camera
      const formData = new FormData();
      formData.append("selfie", selfieFile);

      const response = await axios.post(
        "https://c2u-api.onrender.com/get-my-photos",
        formData
      );

      if (response.data.message === "Photos found for your selfie") {
        setPhotos(response.data.imageUrls.filter(url => url != null)); // Filtering out null values
        setLoading(false); // Stop loading
        setCurrentView('PhotoGallery');
      } else {
        alert("No photos found for your selfie. Please try again later.");
        setLoading(false); // Stop loading
        setCurrentView('home');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      setLoading(false); // Stop loading
      setCurrentView('home');
    }
  };

  return (
    <div className="App">
      {currentView === 'home' && (
        <div className="home">
          <h1>Welcome to Cam to You</h1>
          <button onClick={() => setCurrentView('camera')}>Continue</button>
        </div>
      )}
      {currentView === 'camera' && <Camera onCapture={handleSelfieCapture} />}
      {currentView === 'PhotoGallery' && <PhotoGallery photos={photos} onRetake={() => setCurrentView('camera')} />}
    </div>
  );
}

export default App;