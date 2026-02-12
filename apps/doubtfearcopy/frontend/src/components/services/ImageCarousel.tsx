import React, { useState } from 'react';

type Props = {
  images: string[];
};

const ImageCarousel: React.FC<Props> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((current - 1 + images.length) % images.length);
  const next = () => setCurrent((current + 1) % images.length);

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="aspect-[16/9] bg-black">
        <img
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <button aria-label="Previous" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-sm">‹</button>
      <button aria-label="Next" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-sm">›</button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to image ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full ${i === current ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;