import React from 'react';
import Gallery from 'react-grid-gallery';

function PhotoGallery({ photos, onRetake }) {
  const images = photos.map(url => ({ src: url, thumbnail: url, thumbnailWidth: 320, thumbnailHeight: 212 }));

  return (
    <div>
      <Gallery images={images} />
      <button onClick={onRetake}>Retake Selfie</button>
    </div>
  );
}

export default PhotoGallery;