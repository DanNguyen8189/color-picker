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
            <div className="body">
            <section className="canvas-panel">
            <div className='controls-wrapper'>
                <div className="control-row">
            <ImageUploader />
            </div>
            <div className="control-row">
            {imageObjectUrlRef.current && <Slider handleSlide={handleSlide} />}
            </div>
            </div>
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
        <div className="about-section">
            <h4>About Colorsmosis</h4>
            <p>Colorsmosis is a palette exploration tool that you can use make color palettes from
                your images. Made with React + Astro, and <a href="https://github.com/react-grid-layout/react-draggable">React-Draggable</a> Hosted on netlify. 
                View the source code on <a href="https://github.com/DanNguyen8189/color-picker">GitHub</a>.
            </p>
            </div>
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