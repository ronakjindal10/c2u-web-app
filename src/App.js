import React, { useRef, useState } from "react";
import {Helmet} from "react-helmet";
import Webcam from "react-webcam";
import axios from "axios";
import { Container, Row, Col, Button, Spinner, Modal } from "react-bootstrap";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [showSelfie, setShowSelfie] = useState(true); // state variable to show or hide the selfie and webcam component
  const [loading, setLoading] = useState(false); // state variable to show or hide the loading animation
  const [imageLoadStatus, setImageLoadStatus] = useState({}); // state variable to  track if an image has loaded
  const [photos, setPhotos] = useState([]); // state variable to store the photos from the API response
  const [showModal, setShowModal] = useState(false); // state variable to show or hide the modal component
  const [modalContent, setModalContent] = useState(null); // state variable to store the modal content (image URL)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; // check if the device is an iOS device

  const capture = React.useCallback(() => {
    const processSelfieAndFetchPhotos = async () => {
      const imageSrc = webcamRef.current.getScreenshot();
      const file = base64ToFile(imageSrc, "image/jpeg", "selfie.jpg");
      setImgSrc(file);
      setShowSelfie(false); // hide the selfie and webcam component after capturing
      setLoading(true); // show the loading animation while fetching the photos
  
      try {
        const processedSelfie = await compressAndResizeImage(file);
        fetchPhotos(processedSelfie); // call the function to fetch the photos from the API
      } catch (error) {
        console.error('Error processing the selfie:', error);
        // Handle the error appropriately
      }
    };
  
    processSelfieAndFetchPhotos();
  }, [webcamRef]);

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

  const fetchPhotos = async (file) => {
    try {
      const formData = new FormData();
      formData.append("selfie", file);
      const response = await axios.post(
        "https://c2u-api.onrender.com/get-my-photos",
        formData
      );
      console.log(response.data);
      if (response.data.message === "Photos found for your selfie") {
        setPhotos(response.data.imageUrls); // store the photos in the state variable
        setImageLoadStatus(response.data.imageUrls.reduce((status, url) => {
          status[url] = false;
          return status;
        }, {})); // set the image load status to false for all the photos
      } else {
        alert("No photos found for your selfie. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
    }
    setLoading(false); // hide the loading animation after fetching the photos
  };

  const handleShowModal = (imageURL) => {
    setModalContent(imageURL); // set the modal content to be the image URL
    setShowModal(true); // show the modal component
  };

  const handleCloseModal = () => {
    setShowModal(false); // hide the modal component
  };

  const retakeSelfie = () => {
    setImgSrc(null);
    setShowSelfie(true); // show the selfie and webcam component again
    setPhotos([]); // clear the photos from the state variable
  };

  const handleImageAction = async (imageUrl) => { 
    if (isIOS) {
      // iOS devices - use the Web Share API
      try {
        const response = await fetch(imageUrl, { mode: 'no-cors' });
        const blob = await response.blob();
        const file = new File([blob], 'CamToYou-downloaded-photo.jpg', { type: 'image/jpeg' });
        console.log('Navigator.share: ', navigator.share);
        console.log('navigator.canShare: ', navigator.canShare);
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'Downloaded Photo',
            text: 'My photo from the event!',
          });
        } else {
          console.log('Web Share API is not supported in your browser.');
          // Fallback for iOS browsers that do not support sharing files
          // You can display the image in a new tab or offer instructions to download manually
        }
      } catch (error) {
        console.error('Sharing failed', error);
      }
    } else {
      // Non-iOS devices - trigger a normal download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'CamToYou-downloaded-photo.jpg'; // Provide a default filename for the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleImageLoad = (imageUrl) => {
    setImageLoadStatus(prevStatus => ({ ...prevStatus, [imageUrl]: true }));
  };

  function compressAndResizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.5) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
  
      image.onload = () => {
        let width = image.width;
        let height = image.height;
  
        // Calculate the new dimensions maintaining the aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
  
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
  
        canvas.toBlob(blob => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', quality);
      };
  
      image.onerror = error => reject(error);
    });
  }  

  return (
    <div className="App">
      <Helmet>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YCGC9KDZ2B"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-YCGC9KDZ2B');
          `}
        </script>
      </Helmet>
      <Container fluid>
        <Row className="header">
          <Col>
            <h1>CamToYou</h1>
          </Col>
          <Col className="retake-button">
            {photos.length > 0 && ( // only show the retake button if there are photos
              <Button variant="outline-primary" onClick={retakeSelfie}>
                Retake Selfie
              </Button>
            )}
          </Col>
        </Row>
        {showSelfie ? ( // conditionally render the selfie and webcam component based on showSelfie state variable
          <Row className="webcam">
            <Col>
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
              {imgSrc && (
                <img src={imgSrc} alt="selfie" className="selfie-image" />
              )}
            </Col>
          </Row>
        ) : null}
        <Row className="capture-button">
          <Col>
            {showSelfie && ( // only show the capture button if showSelfie is true
              <Button variant="primary" onClick={capture} className="capture">
                Take selfie
              </Button>
            )}
          </Col>
        </Row>
        {loading ? ( // conditionally render the loading animation based on loading state variable
          <Row className="spinner">
            <Col>
              <Spinner animation="border" variant="primary" />
            </Col>
          </Row>
        ) : null}
        <Row className="photos">
          {photos.map((photo, index) => ( // map over the photos array and render each photo in a column
            photo && ( // only render the photo if it is not null
            <Col key={index} xs={4} className="photo">
              {console.log(imageLoadStatus)}
              {!imageLoadStatus[photo] ? (
                <div className="photo-placeholder" />
                ) : null}
                <img
                  src={photo}
                  alt={`photo-${index}`}
                  className="photo-image"
                  style={{ display: imageLoadStatus[photo] ? 'block' : 'none' }}
                  onLoad={() => handleImageLoad(photo)} // call the handleImageLoad function with the photo URL when the image loads
                  onClick={() => handleShowModal(photo)} // call the handleShowModal function with the photo URL when clicked
                />
              </Col>
              )
            ))}
        </Row>
      </Container>
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered> {/*render the modal component with the modalContent as the image URL*/}
        <Modal.Body>
          <img src={modalContent} alt="modal-image" className="modal-image" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <a href={modalContent} download> {/*use an anchor tag with a download attribute to enable downloading the image*/}
          <Button variant="primary" onClick={() => handleImageAction(modalContent)}>
            {isIOS ? 'Share' : 'Download'}
          </Button>
          </a>
        </Modal.Footer>
      </Modal>
</div>
  );
}

export default App;