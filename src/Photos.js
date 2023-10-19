// This is the Photos component that displays the photos from the API
import React, { useState } from "react";
import Modal from "react-modal"; // This is a third-party library that provides a modal component

function Photos({ photos, onRetake }) {
  const [modalIsOpen, setModalIsOpen] = useState(false); // This state indicates whether the modal is open or not
  const [selectedPhoto, setSelectedPhoto] = useState(null); // This state stores the selected photo URL

  // This function handles the click event on a photo element
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo); // Set the selectedPhoto state to the photo URL
    setModalIsOpen(true); // Set the modalIsOpen state to true to open the modal
  };

  // This function handles the close event on the modal element
  const closeModal = () => {
    setModalIsOpen(false); // Set the modalIsOpen state to false to close the modal
    setSelectedPhoto(null); // Reset the selectedPhoto state to null
  };

  return (
    <div className="Photos">
      <h2>Your photos from the event</h2>
      <div className="grid">
        {photos.map((photo, index) => (
          <div key={index} className="item">
            {photo ? (
              <img src={photo} alt={`Photo ${index + 1}`} onClick={() => handlePhotoClick(photo)} /> // If photo is not null, show it as an image element with src attribute as the photo URL, alt attribute as "Photo i" where i is index + 1, and click handler function as handlePhotoClick with photo as an argument
            ) : (
              <p className="placeholder">No photo available</p> // If photo is null, show a paragraph element with class name "placeholder" and text content as "No photo available"
            )}
          </div>
        ))}
      </div>
      <button onClick={onRetake}>Retake selfie</button> {/*Show a button element with click handler function as onRetake prop*/}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}> {/*// Show a Modal element with isOpen attribute as modalIsOpen state and onRequestClose attribute as closeModal function*/}
        {selectedPhoto && (
          <div className="modal-content">
            <img src={selectedPhoto} alt="Selected photo" /> {/*If selectedPhoto is not null, show it as an image element with src attribute as selectedPhoto state and alt attribute as "Selected photo"*/}
            <a href={selectedPhoto} download>Download</a> {/*Show an anchor element with href attribute as selectedPhoto state and download attribute to enable downloading of the image file*/}
            <button onClick={closeModal}>Close</button> {/*Show a button element with click handler function as closeModal function*/}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Photos;
