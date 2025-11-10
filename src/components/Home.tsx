import React, { useState, useEffect, useRef, use } from 'react';
import Slider from './Slider/Slider';
import ImageUploader from './ImageUploader/ImageUploader';

import type { ImagePin } from "../util/Types";

// import { set } from 'astro:schema';

import { writeImage } from '../hooks/writeImage';
import { PinOverlay } from './PinOverlay/PinOverlay';
import { Palette } from './Pallete/Pallete';



function Home(){
    const [count, setCount] = useState(1);

    const [selectedImage, setSelectedImage] = useState<string>('');
    const prevUrlRef = useRef<string | null>(null);

    const [pins, setPins] = useState<ImagePin[]>([]);

    // reference to container div that holds both the image and the pins
    const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the image container

    const canvasRef = useRef<HTMLCanvasElement| null>(null);

    const canvasInstanceRef = writeImage(canvasRef, selectedImage);

    // // map of node refs for each pin so react-draggable can use nodeRef per draggable
    // const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

    const handleSlide = (num:number) => {
        setCount(num);
    };


    const handlePickImage = (image:File) => {
        const url = URL.createObjectURL(image);
        // URL.createObjectURL creates a new blob URL each time it's called,
        // so we need to clean up the previous one.
        if (prevUrlRef.current) {
            URL.revokeObjectURL(prevUrlRef.current);
        }
        prevUrlRef.current = url;
        setSelectedImage(url);
    }


    useEffect(() => {
        // cleanup blob URL on unmount
        return () => {
            if (prevUrlRef.current) {
            URL.revokeObjectURL(prevUrlRef.current);
            }
        };
    }, []);

    return (
        <div>
            <ImageUploader handlePickImage={handlePickImage}/>
            {selectedImage && (
                <Slider handleSlide={handleSlide} />
            )}
            {selectedImage && (
            <div ref={containerRef} style={{ position: "relative", display: "inline-block", width:"50%" }}>
                {/* <ImageColorPicker
                    imgSrc={URL.createObjectURL(selectedImage)}
                    onColorPick={ handleColorPick }
                    zoom={1}
                /> */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                }}>
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
                            objectFit: 'cover',
                        }}
                        ></canvas>
                </div>
                <PinOverlay count={count} canvasInstanceRef={canvasInstanceRef} setPinsParent={setPins}/>
                <Palette Pins={pins} />
            </div>
            )}
        </div>
    )
}
export default Home;