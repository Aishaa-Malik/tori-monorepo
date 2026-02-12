// Hero Text Flickering Animation
// Creates a letter-by-letter flickering effect for the hero text

class HeroTextFlicker {
  constructor() {
    this.isInitialized = false;
    this.animationRunning = false;
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAnimation());
    } else {
      this.initializeAnimation();
    }
  }

  initializeAnimation() {
    if (this.isInitialized || this.animationRunning) return;
    
    const heroTextSegments = document.querySelectorAll('.hero-text-segment');
    
    if (heroTextSegments.length === 0) {
      console.warn('⚠️ Hero text segments not found. Retrying in 500ms...');
      setTimeout(() => this.initializeAnimation(), 500);
      return;
    }

    this.isInitialized = true;
    this.startFlickerAnimation(heroTextSegments);
  }

  startFlickerAnimation(segments) {
    if (this.animationRunning) return;
    this.animationRunning = true;

    // Combine all text from segments
    const fullText = Array.from(segments).map(segment => segment.textContent).join('');
    
    // Clear all segments initially
    segments.forEach(segment => {
      segment.style.opacity = '0';
      segment.innerHTML = '';
    });

    // Create letter-by-letter animation
    this.animateLetters(fullText, segments);
  }

  animateLetters(fullText, segments) {
    const letters = fullText.split('');
    let currentIndex = 0;
    let currentSegmentIndex = 0;
    let currentSegmentText = '';
    
    // Get original text for each segment
    const originalTexts = Array.from(segments).map(segment => segment.textContent);
    let segmentStartIndex = 0;

    const animateNextLetter = () => {
      if (currentIndex >= letters.length) {
        // Animation complete
        this.animationRunning = false;
        return;
      }

      const currentLetter = letters[currentIndex];
      
      // Find which segment this letter belongs to
      while (currentSegmentIndex < originalTexts.length) {
        const segmentText = originalTexts[currentSegmentIndex];
        const segmentEndIndex = segmentStartIndex + segmentText.length;
        
        if (currentIndex < segmentEndIndex) {
          // This letter belongs to current segment
          const segment = segments[currentSegmentIndex];
          segment.style.opacity = '1';
          
          // Add letter to current segment
          const letterIndexInSegment = currentIndex - segmentStartIndex;
          const segmentLetters = segmentText.split('');
          
          // Create flickering effect
          this.createFlickerEffect(segment, segmentLetters, letterIndexInSegment, () => {
            currentIndex++;
            setTimeout(animateNextLetter, 50); // Delay between letters
          });
          
          return;
        } else {
          // Move to next segment
          segmentStartIndex = segmentEndIndex;
          currentSegmentIndex++;
        }
      }
    };

    // Start animation
    animateNextLetter();
  }

  createFlickerEffect(segment, letters, letterIndex, callback) {
    const currentText = letters.slice(0, letterIndex).join('');
    const newLetter = letters[letterIndex];
    
    if (!newLetter) {
      callback();
      return;
    }

    // Flickering sequence
    const flickerSequence = [
      { text: currentText + '█', duration: 100 }, // Block cursor
      { text: currentText + newLetter, duration: 50 }, // Show letter
      { text: currentText + '█', duration: 80 }, // Block cursor again
      { text: currentText + newLetter, duration: 50 }, // Show letter
      { text: currentText + '█', duration: 60 }, // Block cursor
      { text: currentText + newLetter, duration: 0 } // Final letter
    ];

    let flickerIndex = 0;
    
    const executeFlicker = () => {
      if (flickerIndex >= flickerSequence.length) {
        callback();
        return;
      }

      const step = flickerSequence[flickerIndex];
      segment.innerHTML = step.text;
      
      flickerIndex++;
      
      if (step.duration > 0) {
        setTimeout(executeFlicker, step.duration);
      } else {
        executeFlicker();
      }
    };

    executeFlicker();
  }

  // Method to restart animation
  restart() {
    this.animationRunning = false;
    setTimeout(() => this.initializeAnimation(), 100);
  }
}

// Initialize the flickering animation
let heroFlicker;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    heroFlicker = new HeroTextFlicker();
  });
} else {
  heroFlicker = new HeroTextFlicker();
}

// Also initialize on window load as fallback
window.addEventListener('load', () => {
  if (!heroFlicker || !heroFlicker.isInitialized) {
    heroFlicker = new HeroTextFlicker();
  }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroTextFlicker;
}