import React, { useState, useEffect, useRef } from 'react';
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
  const hasIncrementedViews = useRef(false); 
  const abortControllerRef = useRef(null); 

  const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com';

  const transformImageSrc = (url) => {
    if (!url) return '/placeholder-image.jpg';
    if (url.startsWith('http')) return url;
    const cleanSrc = url.replace(/^\/+/, '');
    return `${API_BASE_URL}/${cleanSrc}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        setLoading(true);
        console.log('Bắt đầu tải bài viết:', slug);
        const res = await fetch(`${API_BASE_URL}/api/new/${slug}`, { signal });
        if (!res.ok) throw new Error('Không thể tải bài viết');
        const data = await res.json();
        setArticle(data);

        if (!hasIncrementedViews.current) {
          console.log('Gửi yêu cầu tăng lượt xem:', slug);
          await fetch(`${API_BASE_URL}/api/new/${slug}/increment-views`, {
            method: 'POST',
            signal,
          });
          hasIncrementedViews.current = true;
          console.log('Đã tăng lượt xem:', slug);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Yêu cầu bị hủy:', slug);
          return;
        }
        setError(err.message);
        console.error('Lỗi khi tải bài viết:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      hasIncrementedViews.current = false;
      console.log('Cleanup useEffect:', slug);
    };
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
        return (
          <div
            key={index}
            className={styles.contentList}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
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