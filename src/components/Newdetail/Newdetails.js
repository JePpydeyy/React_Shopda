import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './postdetails.module.css';

const PostDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Chỉ fetch bài viết, không tăng views
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

  if (loading) return <div>Đang tải bài viết...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!article) return <div>Không có bài viết nào.</div>;

  return (
    <div className="container">
      <div className="postContent">
        <h1 className="postTitle">{article.title}</h1>
        <p>
          <em>
            Ngày đăng: {new Date(article.publishedAt).toLocaleDateString('vi-VN')} | Lượt xem: {article.views}
          </em>
        </p>

        <div
          className="post-html"
          dangerouslySetInnerHTML={{ __html: transformImageSrc(article.content) }}
        />
      </div>

      <div className="navigation">
        <button onClick={() => window.history.back()}>← Quay lại</button>
      </div>
    </div>
  );
};

export default PostDetail;
// Note: Ensure that the API_BASE_URL is correctly set to your backend server URL.