import React, { useState, useEffect, useRef } from 'react';
import Slider from './Slider/Slider';
import { ImageUploader } from './ImageUploader/ImageUploader';
import type { ImagePin } from "../util/Types";
import { PinOverlay } from './PinOverlay/PinOverlay';
import { Palette } from './Palette/Palette';
import { useCanvas, CanvasProvider } from '../util';
import './App.scss';

// Separate component to use the canvas context: CanvasProvider
// wraps around this. Before when we had 1 component, the context
// was not available during initial render, causing errors.
// "useCanvas must be used within CanvasProvider"
// When you have a component that both provides and consumes a context,
// React's rendering order causes problems. (in original attempt, useCanvas was 
// called before <CanvasProvider>)
function AppContent({
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
        <div className="app">
            <h1 className="title">Colorsmosis</h1>
            <section className="canvas-panel">
            <ImageUploader />
            {imageObjectUrlRef.current && <Slider handleSlide={handleSlide} />}
            {/* {imageObjectUrlRef.current && ( */}
            {/* trying to conditional render with jsx (imageObjectUrlRef.current && ...) 
            had a race condition where <canvas> might not have mounted before 
            writeImage was called. So instead always render the canvas, 
            but hide with css if there's no imageUrl
            */}
            {/* <div style={{ display: imageObjectUrlRef.current ? 'block' : 'none'}}> */}
            <div 
                ref={containerRef}
                className="canvas-container"
                style={{ display: imageObjectUrlRef.current ? 'block' : 'none'}}
            >
                {/* <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}> */}
                <canvas
                    className='canvas'
                    ref={canvasRef}
                />
                {/* </div> */}
            <PinOverlay count={count} setPinsParent={setPins} />
            </div>
            </section>
            <section className="palette-panel">
            <Palette Pins={pins} />
            </section>
            {/* </div> */}
        {/* )} */}
        </div>
    );
}

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    return (
        // Provider component; creates context for child components to consume
        <CanvasProvider canvasRef={canvasRef}>
            <AppContent canvasRef={canvasRef} />
        </CanvasProvider>
    );
}