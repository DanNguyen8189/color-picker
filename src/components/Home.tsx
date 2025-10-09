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

    const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the image container
    const buttonRef = useRef<HTMLButtonElement | null>(null); // Ref for the test button
    interface ImageClickEvent extends React.MouseEvent<HTMLImageElement> {}
    // map of node refs for each pin so react-draggable can use nodeRef per draggable
    const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

    const handleSlide = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(current => current + num);
        generatePins(num);
        console.log('argument from Child: ', num);
    };

    const generatePins = (amount:number) => {
        if (pins.length > amount) {
            // for (let i = amount-1; i < pins.length; i++) {
            //     delete pinRefs.current[pins[i].id];
            // }
            setPins(prev => prev.slice(0, amount));
        }
        else if (pins.length < amount) {
            for (let i = 0; i < amount - pins.length; i++) {
                const newPin: ImagePin = {
                    id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
                    positionX: Math.random() * 100, // random position in percentage
                    positionY: Math.random() * 100, // random position in percentage
                    // positionX: 10 + i*5, // staggered positions for testing
                    // positionY: 10 + i*5, // staggered positions for testing
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

    const dragStarts = useRef<Record<string, {x:number, y:number}>>({});



    const handleDragStop = (e: any, data: any, id: string) => {
        if (containerRef.current === null) return;
        //const containerRect = containerRef.current.getBoundingClientRect();
        const containerRect = (containerRef.current.querySelector('img') ?? containerRef.current).getBoundingClientRect();

        const positionX = data.x;
        const positionY = data.y;

        setPins(prev => prev.map(pin => pin.id === id ? { ...pin, positionX, positionY } : pin));
        console.log('pin dragged', id, positionX, positionY);
        
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

    return (
        // <Slider onChange={handleCallback} />
        // <Slider sendData={handleCallback} />
        <div>
            <ImageUploader handlePickImage={handlePickImage}/>
            {selectedImage && (
                <Slider handleSlide={handleSlide} />
            )}
            {selectedImage && (
            <div ref={containerRef} style={{ position: "relative", display: "inline-block", width:"50%" }}>
                <ImageColorPicker
                    imgSrc={URL.createObjectURL(selectedImage)}
                    onColorPick={handleColorPick}
                    zoom={1}
                />

                {/* Overlay for pins - fills the same area as the image and sits on top */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
                    {pins.map((pin, index) => {
                        // create nodeRef for each individual pin
                        if (!pinRefs.current[pin.id]) pinRefs.current[pin.id] = React.createRef<HTMLDivElement>();
                        const pinRef = pinRefs.current[pin.id];

                        return (
                            <Draggable
                                key={pin.id ?? index}
                                axis='both'
                                bounds='parent'
                                defaultPosition={{ x: pin.positionX, y: pin.positionY }}
                                nodeRef={pinRef}
                                onStop={(e: any, data: any) => handleDragStop(e, data, pin.id)}
                            >
                                <div
                                    ref={pinRef}
                                    style={{
                                        position: 'absolute',
                                        // top: `${pin.positionY}%`,
                                        // left: `${pin.positionX}%`,
                                        // top: `${pin.positionY}px`,
                                        // left: `${pin.positionX}px`,
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: 'red',
                                        borderRadius: '50%',
                                        // transform: 'translate(-50%, -50%)',
                                        zIndex: 9999,
                                        pointerEvents: 'auto', // allow clicking/drags on the pin itself
                                    }}
                                />
                            </Draggable>
                        );
                    })}
                </div>
            </div>
            )}
        </div>
    )
}
export default Home;