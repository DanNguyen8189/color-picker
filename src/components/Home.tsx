import React, { useState, useEffect, useRef } from 'react';
import Slider from './Slider';
import ImageUploader from './ImageUploader';

import type { ImagePin } from "./Types";

import { ImageColorPicker } from 'react-image-color-picker';

import { set } from 'astro:schema';

import { writeImage } from '../hooks/writeImage';
import PinOverlay from './PinOverlay';


function Home(){
    const [count, setCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [pins, setPins] = useState<ImagePin[]>([]);

    //reference to container div that holds both the image and the pins
    const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the image container

    const canvasRef = useRef<HTMLCanvasElement| null>(null);

    // handles image upload display
    //const { dimensions } = writeImage(canvasRef, selectedImage ? URL.createObjectURL(selectedImage) : '');
    const canvasInstanceRef = writeImage(canvasRef, selectedImage ? URL.createObjectURL(selectedImage) : '');

    // // map of node refs for each pin so react-draggable can use nodeRef per draggable
    // const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});


    const handleSlide = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(num);
        //generatePins(num);
        if (containerRef.current === null) return;
        const width = containerRef.current.getBoundingClientRect().width
        const height = containerRef.current.getBoundingClientRect().height
        console.log("container size in handleSlide: ", width, height);
    };

    // const generatePins = (amount:number) => {
    //     if (pins.length > amount) {
    //         for (let i = amount; i < pins.length; i++) {
    //             delete pinRefs.current[pins[i].id];
    //         }
    //         setPins(prev => prev.slice(0, amount));
    //     }
    //     else if (pins.length < amount) {
    //         // generate pins at random locations within the image bounds
    //         if (containerRef.current === null) return;
    //         const width = containerRef.current.getBoundingClientRect().width
    //         const height = containerRef.current.getBoundingClientRect().height
    //         for (let i = 0; i < amount - pins.length; i++) {
    //             const newPin: ImagePin = {
    //                 id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
    //                 positionX: Math.random() * width, 
    //                 positionY: Math.random() * height, 
    //                 draggable: true,
    //             };
    //             setPins(prev => [...prev, newPin]);
    //         }
    //     }
    //     console.log("pins after generatePins: ", pins);
    // }

    const handlePickImage = (image:File) => {
        setSelectedImage(image);
    }

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
                <PinOverlay pins2={pins} count={count} canvasInstanceRef={canvasInstanceRef}/>
            </div>
            )}
        </div>
    )
}
export default Home;