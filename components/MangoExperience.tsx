"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";

const FRAME_COUNT = 186;
const SEQUENCE_PATH = "/herofix/scene";
const EXTENSION = ".jpeg";

export default function MangoExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgColor, setBgColor] = useState("#050505");

  // Sync background color with global CSS variable for blending
  useEffect(() => {
    document.documentElement.style.setProperty('--experience-bg', bgColor);
  }, [bgColor]);


  // Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [hideIndicator, setHideIndicator] = useState(false);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest > 0.05) {
      setHideIndicator(true);
    } else {
      setHideIndicator(false);
    }
    
    if (imagesRef.current.length === FRAME_COUNT) {
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(latest * FRAME_COUNT)
      );
      drawFrame(frameIndex);
    }
  });

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const frameIndex = String(i + 1).padStart(5, '0');
      img.src = `${SEQUENCE_PATH}${frameIndex}${EXTENSION}`;
      
      img.onload = () => {
        loadedCount++;
        setLoadedFrames(loadedCount);
        
        if (loadedCount === FRAME_COUNT) {
          imagesRef.current = images;
          
          // Determine edge color dynamically from first frame
          if (images[0] && canvasRef.current) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCanvas.width = images[0].width;
              tempCanvas.height = images[0].height;
              tempCtx.drawImage(images[0], 0, 0);
              const pixelData = tempCtx.getImageData(0, 0, 1, 1).data;
              const rgb = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
              setBgColor(rgb);
            }
          }
          
          setIsLoaded(true);
          drawFrame(0);
        }
      };
      images.push(img);
    }

    return () => {
      imagesRef.current = [];
    };
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (isLoaded && imagesRef.current.length > 0) {
        // Redraw current frame on resize
        const currentFrame = Math.min(
          FRAME_COUNT - 1,
          Math.floor(smoothProgress.get() * FRAME_COUNT)
        );
        drawFrame(currentFrame);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded]);

  // Canvas Draw Logic
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img) return;

    // Canvas size setup
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width;
    canvas.height = height;

    // Fill background dynamically detected
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Calculate "cover" aspect ratio
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    // Draw frame
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  const loadPercentage = Math.round((loadedFrames / FRAME_COUNT) * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400vh] transition-colors duration-1000"
      style={{ backgroundColor: bgColor }}

    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Loading Screen */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#021a02]" // Changed loading screen background
            >
              <div className="flex flex-col items-center gap-8"> {/* Adjusted gap */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <NextImage src="/logo.png" alt="Mango Mamaji" width={120} height={120} className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]"/> {/* Replaced text with Image and animation */}
                </motion.div>
                
                <div className="flex flex-col items-center gap-4"> {/* Adjusted gap */}
                  <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden"> {/* Adjusted progress bar width and height */}
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-400" // Adjusted progress bar gradient
                      initial={{ width: "0%" }}
                      animate={{ width: `${loadPercentage}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]"> {/* Changed text and styling */}
                    Harvesting {loadPercentage}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />

        {/* Scroll Indicator */}
        <AnimatePresence>
          {isLoaded && !hideIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
            >
              <span className="text-white/80 uppercase tracking-[0.4em] text-[10px] font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Scroll to Explore
              </span>
              <div className="w-[1.5px] h-14 bg-gradient-to-b from-green-500 via-yellow-400 to-transparent shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
