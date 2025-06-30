import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './postdetails.module.css';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com';

  const transformImageSrc = (html) => {
    if (!html) return '';
    return html.replace(
      /<img[^>]+src=["']?(?!http|https:\/\/|data:)([^"'>]+)["']?[^>]*>/gi,
      (match, src) => {
        const cleanSrc = src.replace(/^\/+/, '');
        return match.replace(src, `${API_BASE_URL}/${cleanSrc}`);
      }
    );
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

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa bài viết này?');
    if (!confirmDelete || !article?._id) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`${API_BASE_URL}/api/new/${article._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Xóa bài viết thất bại.');
      }

      alert('Bài viết đã được xóa.');
      navigate('/admin/news');
    } catch (err) {
      alert(`Lỗi khi xóa bài viết: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải bài viết...</div>;
  if (error) return <div className={styles.error}>Lỗi: {error}</div>;
  if (!article) return <div className={styles.empty}>Không có bài viết nào.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.postContent}>
        <h1 className={styles.postTitle}>{article.title}</h1>
        <p className={styles.meta}>
          <em>
            Ngày đăng: {new Date(article.publishedAt).toLocaleDateString('vi-VN')} | Lượt xem: {article.views}
          </em>
        </p>

        <div
          className={styles.postHtml}
          dangerouslySetInnerHTML={{ __html: transformImageSrc(article.content) }}
        />

        <div className={styles.navigation}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
