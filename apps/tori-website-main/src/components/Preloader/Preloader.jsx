import React, { useEffect, useState } from 'react'; 
import { ScrollTrigger } from 'gsap/ScrollTrigger'; 

const Preloader = ({ setIsReady }) => { 
  useEffect(() => { 
    // 1. Wait for the window 'load' event (all images/scripts done) 
    const handleLoad = () => { 
      // 2. Small delay to ensure browser paints the final layout 
      setTimeout(() => { 
        ScrollTrigger.refresh(); // Force GSAP to see the final heights 
        setIsReady(true); 
      }, 500); 
    }; 

    if (document.readyState === 'complete') { 
      handleLoad(); 
    } else { 
      window.addEventListener('load', handleLoad); 
      return () => window.removeEventListener('load', handleLoad); 
    } 
  }, [setIsReady]); 

  return ( 
    <div className="preloader-overlay"> 
      <div className="loader-content"> 
        <span className="logo-text">TORI</span> 
        <div className="loader-bar"></div> 
      </div> 
    </div> 
  ); 
}; 

export default Preloader;