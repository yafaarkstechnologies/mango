"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useMotionValueEvent, motion, AnimatePresence, useTransform } from "framer-motion";
import NextImage from "next/image";

const FRAME_COUNT = 144;
const SEQUENCE_PATH = "/crazyfix/scene";
const EXTENSION = ".jpeg";

export default function CrazyExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const [loadedFrames, setLoadedFrames] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgColor, setBgColor] = useState("#050505");
  const [inView, setInView] = useState(false);

  // Sync background color with global CSS variable for blending
  useEffect(() => {
    if (inView) {
      document.documentElement.style.setProperty('--experience-bg', bgColor);
    }
  }, [bgColor, inView]);


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

  const textY = useTransform(smoothProgress, [0, 1], [100, -100]);
  const contentOpacity = useTransform(smoothProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    // Only draw if we are actually scrolling this section to save perf
    if (latest > 0 && latest < 1) {
        if (!inView) setInView(true);
    } else {
        if (inView) setInView(false);
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
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize for no transparency
    if (!ctx) return;

    const img = imagesRef.current[index];
    if (!img) return;

    const { innerWidth: width, innerHeight: height } = window;
    
    // Only resize if necessary
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

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
        
       {/* Small loading indicator if user scrolls here before it's ready */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#021a02]" // Changed loading screen background
            >
              <div className="flex flex-col items-center gap-4">
                 <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                 >
                    <NextImage src="/logo.png" alt="Loading" width={64} height={64} className="opacity-50"/>
                 </motion.div>
                 <div className="text-white/20 font-mono text-[10px] uppercase tracking-widest flex items-center gap-4">
                    Visualizing {loadPercentage}%
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Overlay */}
        <motion.div
            style={{ opacity: contentOpacity }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        >
             <motion.div 
                style={{ y: textY }}
                className="flex flex-col items-center gap-8 text-center px-6"
             >
                <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] uppercase leading-[0.8]">
                    GET YOUR<br/>BOX NOW
                </h2>
                
                <a 
                    href="#collection"
                    className="mt-8 px-12 py-5 rounded-full bg-white text-black font-black text-xl uppercase tracking-[0.3em] hover:bg-green-500 hover:text-white transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] active:scale-95"
                >
                    Order Now
                </a>
             </motion.div>
        </motion.div>

        <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
      </div>
    </div>
  );
}
