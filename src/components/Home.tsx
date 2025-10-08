import React, { useCallback, useState, useEffect } from 'react';
import Slider from './Slider';
import ImageUploader from './ImageUploader';

import type { ImagePin } from "./Types";

import { ImageColorPicker } from 'react-image-color-picker';
import { useRef } from 'react';
import { set } from 'astro:schema';

function Home(){
    const [count, setCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [pins, setPins] = useState<ImagePin[]>([]);

    // const handleCallback = (childData:number) => {
    //     setValue(childData);
    //     console.log(value)
    // };

    const handleSlide = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(current => current + num);
        generatePins(num);
        console.log('argument from Child: ', num);
    };

    const generatePins = (amount:number) => {
        if (pins.length > amount) {
            setPins(prev => prev.slice(0, amount));
        }
        else if (pins.length < amount) {
            for (let i = 0; i < amount - pins.length; i++) {
                const newPin: ImagePin = {
                    id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
                    positionX: Math.random() * 100, // random position in percentage
                    positionY: Math.random() * 100, // random position in percentage
                    draggable: true,
                };
                setPins(prev => [...prev, newPin]);
            }
        }
        console.log("pins after generatePins: ", pins);
    }

    const handlePickImage = (image:File) => {
        setSelectedImage(image);
    }

    // const handlePins = (pins:ImagePin[]) => {
    //     setPins(pins);
    //     console.log("pins: ", pins);
    // }
    const containerRef = useRef<HTMLDivElement | null>(null);
    interface ImageClickEvent extends React.MouseEvent<HTMLImageElement> {}

    // const handleImageClick = (e: ImageClickEvent) => {
    //     // use containerRef (parent with position:relative) to compute coords
    //     //const container = containerRef.current;
    //     if (containerRef.current === null) return;
    //     const rect = containerRef.current.getBoundingClientRect()
    //     const xPx = e.clientX - rect.left;
    //     const yPx = e.clientY - rect.top;

    //     const positionX = (xPx / rect.width) * 100;
    //     const positionY = (yPx / rect.height) * 100;

    //     const imagePin = {
    //         id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
    //         positionX,
    //         positionY,
    //         draggable: true,
    //     };

    //     setPins(prev => {
    //         const next = [...prev, imagePin];
    //         console.log('new pins', next); // now logs correct updated array
    //         return next;
    //     });
    // };

    const handlePinDrag = (e:ImageClickEvent, id:string) => {
        if (containerRef.current === null) return;
        const rect = containerRef.current.getBoundingClientRect()
        const xPx = e.clientX - rect.left;
        const yPx = e.clientY - rect.top;
        const positionX = (xPx / rect.width) * 100;
        const positionY = (yPx / rect.height) * 100; // convert px to %
        setPins((pins.map(pin => pin.id === id ? { ...pin, positionX, positionY } : pin)));
        console.log("pin dragged ", id, positionX, positionY);
    }
    const handleColorPick = (color:string) => {
        console.log("color picked ", color );
    }

    // Dynamically import Draggable to avoid SSR issues
    const [Draggable, setDraggable] = useState<any>(null);
    useEffect(() => {
        let mounted = true;
        // load react-draggable only on the client
        import('react-draggable').then((mod) => {
            if (mounted) setDraggable(() => mod.default || mod);
        }).catch(() => {
            // ignore; we'll render non-draggable pins
        });
      return () => { mounted = false; };
    }, []);

    const nodeRef = React.useRef(null);
    return (
        // <Slider onChange={handleCallback} />
        // <Slider sendData={handleCallback} />
        <div>
            <ImageUploader handlePickImage={handlePickImage}/>
            {selectedImage && (
                <Slider handleSlide={handleSlide} />
            )}
            {selectedImage && (
            <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
                <ImageColorPicker
                    imgSrc={URL.createObjectURL(selectedImage)}
                    onColorPick={handleColorPick}
                    zoom={1}
                />

                {/* Overlay for pins - fills the same area as the image and sits on top */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
                    {pins.map((pin, index) => (
                        <Draggable
                            axis='both'
                            bounds='parent'
                            nodeRef={nodeRef}
                            //event e parameter provided by Draggable's onStop callback, and properly typed to match handler
                            onStop={(e: any) => handlePinDrag(e as unknown as React.MouseEvent<HTMLImageElement>, pin.id)}
                        >
                            <div
                                ref={nodeRef}
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
                        </Draggable>
                    ))}
                </div>
            </div>
            )}
        </div>
    )
}
export default Home;