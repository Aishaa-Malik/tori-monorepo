"use client";
import React, { useState } from 'react';
import './VideoWidget.css';

const VideoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const videoID = "6jca6cMROy8"; // Using the ID found in Spotlight.jsx

  const openVideoModal = () => {
    setIsOpen(true);
  };

  const closeVideoModal = (event) => {
    event.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Small Floating Bubble */}
      {!isOpen && (
        <div id="video-widget-container" onClick={openVideoModal}>
          <div className="mini-player">
            <iframe 
              id="mini-iframe" 
              src={`https://www.youtube.com/embed/${videoID}?autoplay=1&mute=1&loop=1&playlist=${videoID}&controls=0&modestbranding=1&rel=0`} 
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title="Mini Video Preview"
            ></iframe>
            <div className="overlay-click-layer"></div>
          </div>
        </div>
      )}

      {/* 2. The Full Screen Modal */}
      {isOpen && (
        <div id="video-modal-overlay" onClick={closeVideoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeVideoModal}>×</button>
            <div className="video-container-full">
              <iframe 
                id="modal-iframe" 
                src={`https://www.youtube.com/embed/${videoID}?autoplay=1&mute=0&controls=1&rel=0`} 
                frameBorder="0" 
                allow="autoplay; encrypted-media" 
                allowFullScreen
                title="Full Video"
              ></iframe>
            </div>
            <div className="progress-bar-container"><div className="progress-bar-fill"></div></div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoWidget;