import React, { useState, useEffect, useRef } from 'react';
import Slider from './Slider/Slider';
import { ImageUploader } from './ImageUploader/ImageUploader';
import type { ImagePin } from "../util/Types";
import { PinOverlay } from './PinOverlay/PinOverlay';
import { Palette } from './Pallete/Pallete';
import { useCanvas, CanvasProvider } from '../util';

// Separate component to use the canvas context: CanvasProvider
// wraps around this. Before when we had 1 component, the context
// was not available during initial render, causing errors.
// "useCanvas must be used within CanvasProvider"
// When you have a component that both provides and consumes a context,
// React's rendering order causes problems. (in original attempt, useCanvas was 
// called before <CanvasProvider>)
function HomeContent({
    canvasRef
}: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
    const { imageObjectUrlRef } = useCanvas();
    const [count, setCount] = useState(1);
    //const [selectedImage, setSelectedImage] = useState<string>('');
    //const prevUrlRef = useRef<string | null>(null);
    const [pins, setPins] = useState<ImagePin[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleSlide = (num: number) => setCount(num);

    return (
        <div>
        {/* <ImageUploader handlePickImage={handlePickImage} /> */}
        <ImageUploader />
        {imageObjectUrlRef.current && <Slider handleSlide={handleSlide} />}
        {/* {imageObjectUrlRef.current && ( */}
        {/* trying to conditional render with jsx (imageObjectUrlRef.current && ...) 
        had a race condition where <canvas> might not have mounted before 
        writeImage was called. So instead always render the canvas, 
        but hide with css if there's no imageUrl
        */}
            <div style={{ display: imageObjectUrlRef.current ? 'block' : 'none'}}>
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
            </div>
            <Palette Pins={pins} />
            </div>
        {/* )} */}
        </div>
    );
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    return (
        // Provider component; creates context for child components to consume
        <CanvasProvider canvasRef={canvasRef}>
            <HomeContent canvasRef={canvasRef} />
        </CanvasProvider>
    );
}