import React, { useState, useEffect, useRef, use } from 'react';
import Slider from './Slider/Slider';
import ImageUploader from './ImageUploader/ImageUploader';
import { Palette } from './Pallete/Pallete';

import type { ImagePin } from "./Types";

// import { ImageColorPicker } from 'react-image-color-picker';

// import { set } from 'astro:schema';

import { writeImage } from '../hooks/writeImage';
import { PinOverlay } from './PinOverlay/PinOverlay';



function Home(){
    const [count, setCount] = useState(1);
    // const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');

    const [pins, setPins] = useState<ImagePin[]>([]);

    //reference to container div that holds both the image and the pins
    const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the image container

    const canvasRef = useRef<HTMLCanvasElement| null>(null);

    // handles image upload display
    //const { dimensions } = writeImage(canvasRef, selectedImage ? URL.createObjectURL(selectedImage) : '');
    //const canvasInstanceRef = writeImage(canvasRef, selectedImage ? URL.createObjectURL(selectedImage) : '');
    const canvasInstanceRef = writeImage(canvasRef, selectedImage);

    // // map of node refs for each pin so react-draggable can use nodeRef per draggable
    // const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

    const handleSlide = (num:number) => {
        setCount(num);
    };


    const handlePickImage = (image:File) => {
        setSelectedImage(URL.createObjectURL(image));
        //setSelectedImage(image);
    }

    // useEffect(() => {    
    //     console.log("pins in Home component: ", pins);
    // }, [pins]);

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