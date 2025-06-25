import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './postdetails.module.css';

const PostDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://api-tuyendung-cty.onrender.com';

  // Thay thế các src tương đối trong content thành đầy đủ đường dẫn
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
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/new`);
        if (!response.ok) throw new Error(`Lỗi: ${response.statusText}`);
        const data = await response.json();
        const found = Array.isArray(data)
          ? data.find((item) => item._id === id)
          : data.data?.find((item) => item._id === id);
        if (!found) throw new Error('Không tìm thấy bài viết');
        setArticle(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    } else {
      setError('Không có ID bài viết');
      setLoading(false);
    }
  }, [id]);

  const getShareUrls = () => {
    if (!article) return {};
    const url = `https://tinhlamjw.com/${article.slug || ''}`;
    const title = encodeURIComponent(article.title || '');
    const thumb = article.thumbnailUrl
      ? `${API_BASE_URL}/${article.thumbnailUrl.replace(/^\/+/, '')}`
      : 'https://tinhlamjw.com/wp-content/uploads/2025/05/banner-website.jpg';

    return {
      facebook: `https://www.facebook.com/share.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}%20-%20${encodeURIComponent(url)}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(thumb)}&description=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };
  };

  const shareUrls = getShareUrls();

  if (loading) return <div>Đang tải bài viết...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!article) return <div>Không có dữ liệu bài viết</div>;

  return (
    <div className="container">
      {/* Chia sẻ mạng xã hội */}
      <div className="socialShare">
        <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" className="facebook" title="Chia sẻ lên Facebook">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer" className="twitter" title="Chia sẻ lên Twitter">
          <i className="fab fa-twitter"></i>
        </a>
        <a href={shareUrls.pinterest} target="_blank" rel="noopener noreferrer" className="pinterest" title="Chia sẻ lên Pinterest">
          <i className="fab fa-pinterest"></i>
        </a>
        <a href={shareUrls.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin" title="Chia sẻ lên LinkedIn">
          <i className="fab fa-linkedin-in"></i>
        </a>
      </div>

      {/* Nội dung bài viết */}
      <div className="postContent">
        <h1 className="postTitle">{article.title}</h1>
        <p><em>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</em></p>

        {article.content ? (
          <div
            className="post-html"
            dangerouslySetInnerHTML={{ __html: transformImageSrc(article.content) }}
          />
        ) : (
          <div>Không có nội dung để hiển thị.</div>
        )}

        {/* Hình ảnh đính kèm */}
        {article.images && article.images.length > 0 && (
          <div className="article-images">
            <h3>Hình ảnh liên quan</h3>
            <div className="image-gallery">
              {article.images.map((img, index) => {
                const fullSrc = img.startsWith('http')
                  ? img
                  : `${API_BASE_URL}/${img.replace(/^\/+/, '')}`;
                return (
                  <img
                    key={index}
                    src={fullSrc}
                    alt={`Hình ${index + 1}`}
                    style={{ maxWidth: '100%', marginBottom: '1rem' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nút quay lại */}
      <div className="navigation">
        <button onClick={() => window.history.back()}>← Quay lại</button>
      </div>
    </div>
  );
};

export default PostDetail;
