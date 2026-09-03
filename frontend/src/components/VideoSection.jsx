import React, { useState, useEffect, useRef } from 'react';
import './VideoSection.css';

// Load local videos from assets
const localVideoModules = import.meta.glob('../assets/videos/*.{mp4,webm,ogg}', { eager: true });
const localVideos = Object.values(localVideoModules).map((mod, index) => ({
  _id: `local-${index}`,
  title: `Featured Video ${index + 1}`,
  videoUrl: mod.default
}));

const VideoSection = () => {
  const [videos, setVideos] = useState([...localVideos]);
  const [isMuted, setIsMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetch('https://client-projects-backend.onrender.com/api/videos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVideos([...localVideos, ...data]);
        }
      })
      .catch(err => console.error('Error fetching videos:', err));
  }, []);

  // Handle playing only the active video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === activeIndex) {
          video.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
          video.pause();
          video.currentTime = 0; // Optional: reset to start
        }
      }
    });
  }, [activeIndex, videos]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRefs.current.forEach(video => {
      if (video) {
        video.muted = newMutedState;
      }
    });
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  if (videos.length === 0) return null;

  return (
    <div className="video-section-container">
      <h2 className="video-section-title">Our Featured Videos</h2>
      
      <div className="video-slider-container">
        <button className="slider-nav prev-btn" onClick={prevSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <div className="video-slider-track-wrapper">
          <div 
            className="video-slider-track"
            style={{ transform: `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 20}px))` }}
          >
            {videos.map((video, index) => (
              <div 
                key={video._id} 
                className={`video-slide-card ${index === activeIndex ? 'active' : 'inactive'}`}
                onClick={() => setActiveIndex(index)}
              >
                <video 
                  ref={el => videoRefs.current[index] = el}
                  src={video.videoUrl} 
                  className="video-player"
                  loop 
                  muted={isMuted}
                  playsInline
                />
                
                {/* Overlay only visible on active video */}
                {index === activeIndex && (
                  <div className="video-active-overlay">
                    <button className="mute-icon-btn" onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                      {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="slider-nav next-btn" onClick={nextSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      <div className="slider-dots">
        {videos.map((_, idx) => (
          <span 
            key={idx} 
            className={`dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default VideoSection;
