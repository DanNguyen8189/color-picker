import React, { useState, useEffect, useRef } from 'react';
import Slider from './Slider/Slider';
import { ImageUploader } from './ImageUploader/ImageUploader';
import type { ImagePin } from "../util/Types";
import { PinOverlay } from './PinOverlay/PinOverlay';
import { Palette } from './Pallete/Pallete';
import { useCanvas, CanvasProvider } from '../util';

// Separate component to use the canvas context: CanvasProvider
// wraps around this. Before when I had 1 component, the context
// was not available during initial render, causing errors.
// "useCanvas must be used within CanvasProvider"
function HomeContent({
    canvasRef
}: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
    const { writeImage } = useCanvas();
    const [count, setCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const prevUrlRef = useRef<string | null>(null);
    const [pins, setPins] = useState<ImagePin[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleSlide = (num: number) => setCount(num);

    const handlePickImage = (file: File) => {
        const url = URL.createObjectURL(file);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
        setSelectedImage(url);
        // defer until canvas element is mounted
        requestAnimationFrame(() => writeImage(url));
    };

    useEffect(() => () => {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    }, []);

    return (
        <div>
        <ImageUploader handlePickImage={handlePickImage} />
        {selectedImage && <Slider handleSlide={handleSlide} />}
        {selectedImage && (
            <div
            ref={containerRef}
            style={{ position: 'relative', display: 'inline-block', width: '50%' }}
            >
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
                <canvas
                ref={canvasRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    touchAction: 'none',
                    objectFit: 'cover'
                }}
                />
            </div>
            <PinOverlay count={count} setPinsParent={setPins} />
            <Palette Pins={pins} />
            </div>
        )}
        </div>
    );
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    return (
        <CanvasProvider canvasRef={canvasRef}>
            <HomeContent canvasRef={canvasRef} />
        </CanvasProvider>
    );
}