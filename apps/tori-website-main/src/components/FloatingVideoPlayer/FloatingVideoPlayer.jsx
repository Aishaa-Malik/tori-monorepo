"use client";

import { useRef, useState } from "react";
import "./FloatingVideoPlayer.css";

const FloatingVideoPlayer = ({ videoId = "" }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const panelRef = useRef(null);
  const hasVideo = Boolean(videoId);
  const src = hasVideo
    ? `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0&autopause=0`
    : "";

  const openFullscreen = () => {
    const target = panelRef.current;
    if (!target) return;

    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.webkitRequestFullscreen) {
      target.webkitRequestFullscreen();
    }
  };

  return (
    <aside className={`floating-video ${isMinimized ? "is-minimized" : ""}`}>
      <div className="floating-video-panel" ref={panelRef}>
        <div className="floating-video-header">
          <div>
            <strong>Watch the flow</strong>
            <small>20-sec WhatsApp booking</small>
          </div>
          <div className="floating-video-actions">
            <button
              type="button"
              onClick={openFullscreen}
              aria-label="Open video fullscreen"
            >
              ⛶
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize video"
            >
              −
            </button>
          </div>
        </div>
        {hasVideo && !isMinimized ? (
          <>
            <iframe
              src={src}
              title="Tori Ate booking video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
            <button
              className="floating-video-fullscreen"
              type="button"
              onClick={openFullscreen}
              aria-label="Open video fullscreen"
            >
              ⛶
            </button>
          </>
        ) : (
          <div className="floating-video-placeholder">
            <span>Vimeo</span>
            <p>Add your Vimeo video ID to play the launch video here.</p>
          </div>
        )}
      </div>

      <button
        className="floating-video-toggle"
        type="button"
        onClick={() => setIsMinimized(false)}
        aria-label="Open video"
      >
        <span className="floating-video-pulse"></span>
        <span className="floating-video-play">▶</span>
        <span className="floating-video-label">
          <strong>Watch</strong>
          <small>Demo Video</small>
        </span>
      </button>
    </aside>
  );
};

export default FloatingVideoPlayer;
