import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './postdetails.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com';

  const transformImageSrc = (url) => {
    if (!url) return '/placeholder-image.jpg';
    if (url.startsWith('http')) return url;
    const cleanSrc = url.replace(/^\/+/, '');
    return `${API_BASE_URL}/${cleanSrc}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/new/${slug}`);
        if (!res.ok) throw new Error('Không thể tải bài viết');
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        return (
          <p key={index} className={styles.contentText}>
            {block.content}
          </p>
        );
      case 'heading':
        return (
          <h2 key={index} className={styles.contentHeading}>
            {block.content}
          </h2>
        );
      case 'sub_heading':
        return (
          <h3 key={index} className={styles.contentSubHeading}>
            {block.content}
          </h3>
        );
      case 'image':
        return (
          <div key={index} className={styles.contentImageWrapper}>
            <img
              src={transformImageSrc(block.url)}
              alt={block.caption || 'Article image'}
              className={styles.contentImage}
              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
            />
            {block.caption && <p className={styles.imageCaption}>{block.caption}</p>}
          </div>
        );
      case 'list':
        return null; // skip list blocks if content is empty
      default:
        return null;
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải bài viết...</div>;
  if (error) return <div className={styles.error}>Lỗi: {error}</div>;
  if (!article) return <div className={styles.noContent}>Không có bài viết nào.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.postContent}>
        <h1 className={styles.postTitle}>{article.title}</h1>
        <p className={styles.dateLine}>
          <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 6 }} />
          Ngày đăng: {new Date(article.publishedAt).toLocaleDateString('vi-VN')} | Lượt xem: {article.views}
        </p>

        {article.thumbnailUrl && (
          <div className={styles.thumbnailWrapper}>
            <img
              src={transformImageSrc(article.thumbnailUrl)}
              alt={article.thumbnailCaption || article.title}
              className={styles.thumbnailImage}
              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
            />
            {article.thumbnailCaption && (
              <p className={styles.thumbnailCaption}>{article.thumbnailCaption}</p>
            )}
          </div>
        )}

        <div className={styles.contentBlocks}>
          {article.contentBlocks?.map((block, index) => renderContentBlock(block, index))}
        </div>

        <div className={styles.navigation}>
          <button onClick={() => window.history.back()}>← Quay lại</button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
