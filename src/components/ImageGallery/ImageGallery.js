import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../ProductDetail/ProductDetail.module.css';

const ImageGallery = ({ images, currentImageIndex, onNext, onPrev, onThumbnailClick }) => {
  return (
    <div className={styles.leftColumn}>
      <button className={styles.prevBtn} onClick={onPrev}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <img src={images[currentImageIndex]} alt="Main Image" className={styles.mainImage} />
      <button className={styles.nextBtn} onClick={onNext}>
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
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