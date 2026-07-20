import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

function VideoPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { videoUrl, title } = location.state || {};

  // Clean link format fixer
  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      // Split by slash first, then split by question mark to remove tracking text like ?si=
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else {
      return url;
    }
    
    // rel=0 hides related videos from other channels
    // modestbranding=1 hides the large YouTube logo
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  if (!videoUrl) return <div className="main-wrapper">No video selected!</div>;

  return (
    <div className="video-page-wrapper" style={{ background: '#000', minHeight: '100vh', padding: '20px' }}>
      <button onClick={() => navigate(-1)} className="btn-red" style={{ marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>{title}</h2>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
            src={getEmbedUrl(videoUrl)}
            title="Course Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div style={{ marginTop: '30px', color: '#ccc' }}>
            <h3>Course Resources</h3>
            <p>Yahan aap apne notes ya assignment links add kar sakti hain.</p>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;