import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

interface PhotoGalleryProps {
  destination: string;
}

export default function PhotoGallery({ destination }: PhotoGalleryProps) {
  const encoded = encodeURIComponent(destination + " travel");

  // Use Unsplash Source for real destination photos with different queries
  const queries = [
    `${destination} landmark`,
    `${destination} street`,
    `${destination} food`,
    `${destination} nature`,
    `${destination} skyline`,
    `${destination} culture`,
  ];

  const images = queries.map(
    (q, i) =>
      `https://source.unsplash.com/600x400/?${encodeURIComponent(q)}&sig=${i}`
  );

  const [loaded, setLoaded] = useState<boolean[]>(
    new Array(images.length).fill(false)
  );
  const [errors, setErrors] = useState<boolean[]>(
    new Array(images.length).fill(false)
  );

  const markLoaded = (idx: number) => {
    setLoaded((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const markError = (idx: number) => {
    setErrors((prev) => {
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
        {images.map((src, i) =>
          errors[i] ? null : (
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
                onError={() => markError(i)}
                className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
