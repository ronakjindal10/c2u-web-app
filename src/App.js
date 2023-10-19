// This is the main component that renders the app
import React, { useState } from "react";
import Camera from "./Camera"; // This is a custom component that handles the camera access and selfie taking
import Photos from "./Photos"; // This is a custom component that displays the photos from the API
import Loading from "./Loading"; // This is a custom component that shows a loading spinner
import Error from "./Error"; // This is a custom component that shows an error message

function App() {
  const [selfie, setSelfie] = useState(null); // This state stores the selfie image as a base64 string
  const [photos, setPhotos] = useState(null); // This state stores the photos array from the API response
  const [loading, setLoading] = useState(false); // This state indicates whether the app is loading data from the API
  const [error, setError] = useState(null); // This state stores any error message from the API or camera

  // This function handles the selfie taking event from the Camera component
  const handleSelfie = (image) => {
    setSelfie(image); // Set the selfie state to the image base64 string
    setLoading(true); // Set the loading state to true to show the loading spinner
    fetchPhotos(image); // Call the fetchPhotos function with the image as an argument
  };

  // This function handles the retake selfie event from the Photos component
  const handleRetake = () => {
    setSelfie(null); // Reset the selfie state to null
    setPhotos(null); // Reset the photos state to null
    setError(null); // Reset the error state to null
  };

  // This function calls the API with the selfie image and updates the photos state with the response
  const fetchPhotos = async (file) => {
    try {
      const formData = new FormData(); // Create a new FormData object to store the image file
      formData.append("selfie", file); // Append the image file as a file with name "selfie"
      const response = await fetch(
        "https://c2u-api.onrender.com/get-my-photos",
        {
          method: "POST", // Use POST method to send data to the API
          body: formData, // Use formData as the request body
        }
      ); // Await for the response from the API
      const data = await response.json(); // Parse the response as JSON and await for it
      if (data.message === "Photos found for your selfie") {
        // If the message is "Photos found for your selfie"
        setPhotos(data.imageUrls); // Set the photos state to the imageUrls array from the data object
      } else {
        // If the message is anything else (such as "No photos found for your selfie")
        setError(data.message); // Set the error state to the message from the data object
      }
    } catch (err) {
      // If there is any error in fetching or parsing data
      setError(err.message); // Set the error state to the error message
    } finally {
      // Finally, after try or catch block is executed
      setLoading(false); // Set the loading state to false to hide the loading spinner
    }
  };

  return (
    <div className="App">
      <h1>CamToYou</h1>
      <p>Take a selfie and get your photos from the event</p>
      {selfie ? (
        <img src={URL.createObjectURL(selfie)} alt="Your selfie" /> // If there is a selfie, show it as an image element with src attribute as the base64 string and alt attribute as "Your selfie"
      ) : (
        <Camera onSelfie={handleSelfie} onError={setError} /> // If there is no selfie, show the Camera component and pass handleSelfie function as onSelfie prop and setError function as onError prop
      )}
      {/* <Camera onSelfie={handleSelfie} onError={setError} /> */}
      {loading && <Loading />} {/*If loading is true, show the Loading component*/}
      {error && <Error message={error} />} {/*If error is not null, show the Error component and pass error as message prop */}
      {photos && <Photos photos={photos} onRetake={handleRetake} />} {/*If photos is not null, show the Photos component and pass photos as photos prop and handleRetake function as onRetake prop*/}
    </div>
  );
}

export default App;