import React, { useRef, useState, useEffect } from "react";
import {Helmet} from "react-helmet";
import Webcam from "react-webcam";
import axios from "axios";
import { Container, Row, Col, Button, Spinner, Modal } from "react-bootstrap";
import { IoLogoWhatsapp } from "react-icons/io5"; // Import WhatsApp icon
import { IoCameraOutline } from "react-icons/io5"; //Import camera icon
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [showSelfie, setShowSelfie] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const [shownInstagramLinks, setShownInstagramLinks] = useState(() => JSON.parse(localStorage.getItem('shownInstagramLinks')) || []);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [instagramLink, setInstagramLink] = useState(null);

  useEffect(() => {
    localStorage.setItem('shownInstagramLinks', JSON.stringify(shownInstagramLinks));
  }, [shownInstagramLinks]);

  const capture = React.useCallback(() => {
    const processSelfieAndFetchPhotos = async () => {
      const imageSrc = webcamRef.current.getScreenshot();
      const file = base64ToFile(imageSrc, "image/jpeg", "selfie.jpg");
      setImgSrc(file);
      setShowSelfie(false);
      setLoading(true);
  
      try {
        const processedSelfie = await compressAndResizeImage(file);
        fetchPhotos(processedSelfie);
      } catch (error) {
        console.error('Error processing the selfie:', error);
      }
    };
  
    processSelfieAndFetchPhotos();
  }, [webcamRef]);

  const base64ToFile = (base64, type, name) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], name, { type: type });
  };

  const fetchPhotos = async (file) => {
    try {
      const formData = new FormData();
      formData.append("selfie", file);
      const response = await axios.post(
        // "http://localhost:3001/get-my-photos",
        "https://c2u-api.onrender.com/get-my-photos",
        formData
      );
      if (response.data.message === "Photos found for your selfie") {
        // console.log(response.data.photos)
        // Initialize an empty array for photos
        const newPhotos = [];
        const newImageLoadStatus = {};
        response.data.photos.forEach((photo) => {
          if(photo && photo.imageUrl){
            // Check if imageUrl is not null before proceeding
            newPhotos.push(photo.imageUrl);
            newImageLoadStatus[photo.imageUrl] = false; // Initialize loading status for this URL
            // Check for Instagram link and add it if not already shown
            if (photo.instagramLink && !shownInstagramLinks.includes(photo.instagramLink)) {
              setInstagramLink(photo.instagramLink);
              // setShowInstagramModal(true);
              // setShownInstagramLinks((prevLinks) => [...prevLinks, photo.instagramLink]);
            }
          }
        });
        setPhotos(newPhotos);
        setImageLoadStatus(newImageLoadStatus);
      } else {
        alert("No photos found for your selfie. Please try again later.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  const handleShowModal = (imageURL) => {
    setModalContent(imageURL);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const retakeSelfie = () => {
    setImgSrc(null);
    setShowSelfie(true);
    setPhotos([]);
  };

  const handleImageAction = async (imageUrl) => {
    const proxyImageUrl = `https://c2u-api.onrender.com/images/${imageUrl.split('.com/').pop()}`;
    // const proxyImageUrl = `http://localhost:3001/images/${imageUrl.split('.com/').pop()}`;
  
    if (isIOS) {
      try {
        const response = await fetch(proxyImageUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const file = new File([uint8Array], 'CamToYou-downloaded-photo.jpg', { type: 'image/jpeg' });
  
        // Check if the device supports sharing the file
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          // Check if the Web Share API is supported
          if (navigator.share) {
            await navigator.share({
              files: [file]
            });
            console.log('Image shared successfully');
          } else {
            console.log('Web Share API is not supported in your browser.');
          }
        } else {
          console.log('Sharing files is not supported on this device.');
        }
      } catch (error) {
        console.error('Sharing failed', error);
      }
    } else {
      // Handle non-iOS devices (download functionality)
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'CamToYou-downloaded-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    // Show Instagram modal if necessary
    if (instagramLink && !shownInstagramLinks.includes(instagramLink)) {
      setShowInstagramModal(true);
      setShownInstagramLinks((prevLinks) => [...prevLinks, instagramLink]);
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
          <Col className="retake-help-button">
            <Button variant="outline-primary" onClick={retakeSelfie} className="retake-selfie-button">
            <IoCameraOutline /> Retake
            </Button>
            <Button variant="outline-primary" onClick={() => window.open('https://wa.me/918282809499', '_blank')} className="help-button">
            <IoLogoWhatsapp /> Help
            </Button>
          </Col>
        </Row>
        {showSelfie ? (
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
            {showSelfie && (
              <Button variant="primary" onClick={capture} className="capture">
                Take selfie
              </Button>
            )}
          </Col>
        </Row>
        {loading ? (
          <Row className="spinner">
            <Col>
              <Spinner animation="border" variant="primary" />
            </Col>
          </Row>
        ) : null}
        <Row className="photos">
          {photos.map((photo, index) => (
            photo && (
            <Col key={index} xs={4} className="photo">
              {!imageLoadStatus[photo] ? (
                <div className="photo-placeholder" />
                ) : null}
                <img
                  src={photo}
                  alt={`photo-${index}`}
                  className="photo-image"
                  style={{ display: imageLoadStatus[photo] ? 'block' : 'none' }}
                  onLoad={() => handleImageLoad(photo)}
                  onClick={() => handleShowModal(photo)}
                />
              </Col>
              )
            ))}
        </Row>
      </Container>
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Body>
          <img src={modalContent} alt="modal-image" className="modal-image" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleImageAction(modalContent)}>
            {isIOS ? 'Share' : 'Download'}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showInstagramModal} onHide={() => setShowInstagramModal(false)} size="lg" centered>
        <Modal.Body>
          Follow us on Instagram to keep in touch!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            window.open(instagramLink, '_blank');
            setShowInstagramModal(false);
          }}>
            Open Instagram
          </Button>
          <Button variant="secondary" onClick={() => setShowInstagramModal(false)}>
            No thanks
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;