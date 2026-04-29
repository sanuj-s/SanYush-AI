import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

interface PhotoGalleryProps {
  destination: string;
}

export default function PhotoGallery({ destination }: PhotoGalleryProps) {
  const encoded = encodeURIComponent(destination);

  // We generate multiple unique image URLs by appending different query params
  const images = [
    `https://loremflickr.com/600/400/${encoded},landmark?random=1`,
    `https://loremflickr.com/600/400/${encoded},street?random=2`,
    `https://loremflickr.com/600/400/${encoded},food?random=3`,
    `https://loremflickr.com/600/400/${encoded},nature?random=4`,
    `https://loremflickr.com/600/400/${encoded},architecture?random=5`,
    `https://loremflickr.com/600/400/${encoded},culture?random=6`,
  ];

  const [loaded, setLoaded] = useState<boolean[]>(new Array(images.length).fill(false));

  const markLoaded = (idx: number) => {
    setLoaded(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-4 h-4 text-muted-foreground" />
        <span className="label-xs">Discover {destination}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: loaded[i] ? 1 : 0.3, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className={`relative overflow-hidden rounded-xl ${
              i === 0 ? "col-span-2 row-span-2" : ""
            } group cursor-pointer`}
          >
            <img
              src={src}
              alt={`${destination} photo ${i + 1}`}
              onLoad={() => markLoaded(i)}
              className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
