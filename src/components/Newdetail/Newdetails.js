import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Sử dụng useParams
import './postdetails.module.css';

const PostDetail = () => {
  const { id } = useParams(); // Lấy id từ path parameter
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy biến môi trường
  const API_BASE_URL = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log('Fetching article with id:', id);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/new`); // Sử dụng REACT_APP_API_URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        const foundArticle = Array.isArray(data) ? data.find(item => item._id === id) : null;
        if (!foundArticle) {
          throw new Error('Article not found');
        }
        setArticle(foundArticle);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    } else {
      setError('No article ID provided');
      setLoading(false);
    }
  }, [id]);

  const getShareUrls = () => {
    if (!article) return {};
    const articleUrl = `https://tinhlamjw.com/${article.slug || ''}`;
    const articleTitle = encodeURIComponent(article.title || '');
    const thumbnail = article.thumbnailUrl ? `${API_BASE_URL}/${article.thumbnailUrl}` : 'https://tinhlamjw.com/wp-content/uploads/2025/05/banner-website.jpg';

    return {
      facebook: `https://www.facebook.com/share.php?u=${encodeURIComponent(articleUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${articleTitle}%20-%20${encodeURIComponent(articleUrl)}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(articleUrl)}&media=${encodeURIComponent(thumbnail)}&description=${articleTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    };
  };

  const shareUrls = getShareUrls();

  if (loading) return <div>Loading...</div>;
  if (error && error.includes('404')) return <div>Lỗi: Không tìm thấy bài viết. Vui lòng kiểm tra ID hoặc liên hệ quản trị viên.</div>;
  if (error) return <div>Lỗi: {error}. Vui lòng thử lại sau.</div>;
  if (!article) return <div>Lỗi: Không tìm thấy dữ liệu bài viết</div>;

  return (
    <div className="container">
      <div className="social-share">
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

      <div className="post-content">
        <h1 className="post-title">{article.title}</h1>
        <p><em>{article['category-new']} - {new Date(article.publishedAt).toLocaleDateString('vi-VN')}</em></p>

        {article.contentBlocks.map((block, index) => (
          <div key={block._id || index}>
            {block.type === 'heading' && <h2 id={`section${index}`}>{block.content}</h2>}
            {block.type === 'text' && <p dangerouslySetInnerHTML={{ __html: block.content }} />}
            {block.type === 'list' && (
              <ul>
                {block.content.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            )}
            {block.type === 'image' && (
              <div style={{ textAlign: 'center' }}>
                <img src={`${API_BASE_URL}/${block.url}`} alt={block.caption} width="450  " height="auto" />
                {block.caption && (
                  <p>
                    <a href="https://tinhlamjw.com/shop/?bo-suu-tap=bst-charm-kim-long-phat-loc">
                      <em>{block.caption}</em>
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="navigation">
        <button onClick={() => window.history.back()}>Quay lại</button>
      </div>
    </div>
  );
};

export default PostDetail;