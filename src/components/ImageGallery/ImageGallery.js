import React from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images, currentImageIndex, onNext, onPrev, onThumbnailClick }) => {
  return (
    <div className={styles.leftColumn}>
      <button className={styles.prevBtn} onClick={onPrev}>←</button>
      <img src={images[currentImageIndex]} alt="Main Image" className={styles.mainImage} />
      <button className={styles.nextBtn} onClick={onNext}>→</button>
      <div className={styles.thumbnailGallery}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index + 1}`}
            className={styles.thumbnail}
            onClick={() => onThumbnailClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;