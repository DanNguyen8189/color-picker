import React, { useCallback, useState } from 'react';
import Slider from './Slider';
import ImageUploader from './ImageUploader';
import ImagePinDrop from './ImagePinDrop';
import SliderTwo from './SliderTwo';
import type { number } from 'astro:schema';

import type {ImagePin} from "./Types";
import { ImagePinContainer } from 'react-image-pin';
import { ImagePinContainer2 } from './ImagePinContainer2';
import { ImageColorPicker } from 'react-image-color-picker';
import { useRef } from 'react';

function Home(){
    const [count, setCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [pins, setPins] = useState<ImagePin[]>([]);

    // const handleCallback = (childData:number) => {
    //     setValue(childData);
    //     console.log(value)
    // };

    const handleCallback = () => {
        console.log("callback called");
    };

    const handleSlide = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(current => current + num);

        console.log('argument from Child: ', num);
    };

    const handlePickImage = (image:File) => {
        setSelectedImage(image);
    }

    const handlePins = (pins:ImagePin[]) => {
        setPins(pins);
        console.log("pins: ", pins);
    }
    const containerRef = useRef<HTMLDivElement | null>(null);
    interface ImageClickEvent extends React.MouseEvent<HTMLImageElement> {}
    const handleImageClick = (e: ImageClickEvent) => {
    // use containerRef (parent with position:relative) to compute coords
    //const container = containerRef.current;
    if (containerRef.current === null) return;
    const rect = containerRef.current.getBoundingClientRect()
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const positionX = (xPx / rect.width) * 100;
    const positionY = (yPx / rect.height) * 100;

    const imagePin = {
        id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
        positionX,
        positionY,
        draggable: true,
    };

    setPins(prev => {
        const next = [...prev, imagePin];
        console.log('new pins', next); // now logs correct updated array
        return next;
    });
    };
    const handleColorPick = (color:string) => {
        console.log("color picked ", color );
    }
    return (
        // <Slider onChange={handleCallback} />
        // <Slider sendData={handleCallback} />
        <div>
            <Slider handleSlide={handleSlide} />
            <ImageUploader handlePickImage={handlePickImage}/>
            {/* {selectedImage && (
                <div>
                <img
                    alt="not found"
                    width={"250px"}
                    src={URL.createObjectURL(selectedImage)}
                />
                <br /> <br />
                <button onClick={() => setSelectedImage(null)}>Remove</button>
                </div>
            )} */}
            {/* <SliderTwo /> */}

            {/* {selectedImage && (
                <ImagePinDrop props={{ image: selectedImage }} handlePins={handlePins}/>
            )} */}
            {/* <ImagePinDrop image={selectedImage}/> */}
            
            {/* {selectedImage && (
            <ImagePinContainer2
                image={URL.createObjectURL(selectedImage)}
                imageAlt="A beautiful image"
                draggable={true}
                pins={pins}
                onNewPin={(pin) => {
                    const imagePin = {
                        id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
                        positionX: pin.positionX,
                        positionY: pin.positionY,
                        draggable: true,
                    };
                    setPins(prev => [...prev, imagePin]);
                    console.log('new pin', imagePin);
                }}
                onExistingPin={(pin) => {
                    setPins((prev) =>
                        prev.map((p) => (p.id === pin.id ? { ...p, positionX: pin.positionX, positionY: pin.positionY } : p))
                    );
                    console.log('existing pin changed', pin);
                }}
                onDraggedPin={(pin) => {
                    setPins((prev) =>
                        prev.map((p) => (p.id === pin.id ? { ...p, positionX: pin.positionX, positionY: pin.positionY } : p))
                    );
                    console.log('dragged pin', pin);
                }}
            />
            )} */}
            {selectedImage && (
            <div ref={containerRef} onClick={handleImageClick} style={{ position: "relative", display: "inline-block" }}>
                <ImageColorPicker
                    imgSrc={URL.createObjectURL(selectedImage)}
                    onColorPick={handleColorPick}
                    zoom={1}
                />

                {/* Overlay for pins - fills the same area as the image and sits on top */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
                    {pins.map((pin, index) => (
                        <div
                            key={pin.id ?? index}
                            style={{
                                position: 'absolute',
                                top: `${pin.positionY}%`,
                                left: `${pin.positionX}%`,
                                width: '10px',
                                height: '10px',
                                backgroundColor: 'red',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 9999,
                                pointerEvents: 'auto', // allow clicking/drags on the pin itself
                            }}
                        />
                    ))}
                </div>
            </div>
            )}
        </div>
    )

}
export default Home;