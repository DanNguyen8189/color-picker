import React, { useCallback, useState, useEffect } from 'react';
import Slider from './Slider';
import ImageUploader from './ImageUploader';

import type { ImagePin } from "./Types";

import { ImageColorPicker } from 'react-image-color-picker';
import { useRef } from 'react';
import { set } from 'astro:schema';

import { useColorPick } from './useColorPick';


function Home(){
    const [count, setCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [pins, setPins] = useState<ImagePin[]>([]);

    const [color2, setColor2] = useState<string>('');
    const [draggedPinId, setDraggedPinId] = useState<string>('');

    const containerRef = useRef<HTMLDivElement | null>(null); // Ref for the image container

    const canvasRef = useRef<HTMLCanvasElement| null>(null);

    // map of node refs for each pin so react-draggable can use nodeRef per draggable
    const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

    const { color, coordinates, dimensions } = useColorPick(canvasRef, selectedImage ? URL.createObjectURL(selectedImage) : '');


    const handleSlide = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(current => current + num);
        generatePins(num);
        console.log('argument from Child: ', num);
    };

    const generatePins = (amount:number) => {
        if (pins.length > amount) {
            for (let i = amount; i < pins.length; i++) {
                delete pinRefs.current[pins[i].id];
            }
            setPins(prev => prev.slice(0, amount));
        }
        else if (pins.length < amount) {
            // generate pins at random locations within the image bounds
            if (containerRef.current === null) return;
            const width = containerRef.current.getBoundingClientRect().width
            const height = containerRef.current.getBoundingClientRect().height
            for (let i = 0; i < amount - pins.length; i++) {
                const newPin: ImagePin = {
                    id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
                    positionX: Math.random() * width, 
                    positionY: Math.random() * height, 
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

    const handleDrag = (e:any, data:any, id:string) => {
        e.preventDefault();
        // e.stopPropagation(); // Prevent the click from being intercepted
        const positionX = data.x;
        const positionY = data.y;
        //console.log('color picked', color, coordinates, dimensions);
    }

    const handleDragStop = (e: any, data: any, id: string) => {
        e.preventDefault();
        // e.stopPropagation(); // Prevent the click from being intercepted
        if (containerRef.current === null) return;
        //const containerRect = containerRef.current.getBoundingClientRect();
        const containerRect = (containerRef.current.querySelector('img') ?? containerRef.current).getBoundingClientRect();

        const positionX = data.x;
        const positionY = data.y;
        setDraggedPinId(id);
        setPins(prev => prev.map(pin => pin.id === id ? { ...pin, positionX, positionY } : pin));
        console.log('position from draggable', id, positionX, positionY);
        //console.log('color picked', color, coordinates, dimensions);
        const {newx, newy} = getCoordinates(positionX, positionY) ?? {x2:0, y2:0};
        if (newx === undefined || newy === undefined) return;

        //console.log("color from useColorPick: ", getPixelColor(newx, newy));
        console.log("color from useColorPick: ", newx, ", ", newy, ", ", getPixelColor(newx, newy));
    }

    const handleColorPick = (color:string) => {
        setColor2(color);
        console.log("color picked from handlecolorpick: ", color );
    }

    const getPixelColor = (x: number, y: number) =>{
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !canvasRef.current) return 'rgb(0,0,0)';
            const pixelData = ctx.getImageData(
                x,
                y,
            1,
            1
            ).data
            if (pixelData.length < 4) return 'rgb(0,0,0)' // Return black color if unable to retrieve pixel data
    
            const [red, green, blue] = pixelData
            return `rgb(${red}, ${green}, ${blue})`
        }
    // useEffect(() => {
    //     if (draggedPinId && color) {
    //         setPins(prev => prev.map(pin => pin.id === draggedPinId ? { ...pin, color } : pin));
    //         setDraggedPinId('');
    //         setColor('');
    //         console.log("pins after color set: ", pins)
    //     }
    // }, []);

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

    // const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    //     const canvas = canvasRef.current;
    //     if (canvas === null) return;
    //     const ctx = canvas.getContext("2d");
    //     if (ctx === null) return;

    //     // Get click position
    //     const rect = canvas.getBoundingClientRect();
    //     const x = e.clientX - rect.left;
    //     const y = e.clientY - rect.top;

    //     // Get pixel data
    //     //const pixel = ctx.getImageData(x, y, 1, 1).data;
    //     //const color3 = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    //     //console.log('image clicked', color3);
    //     console.log('image clicked', getPixelColor(x, y), " at ", x, ", ", y);
    // }
    const handleImageClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        // Removed eventGoods since React.PointerEvent does not have 'touches'
        
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext("2d");
        if (ctx === null) return;

        // Get click position
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        // Get pixel data
        //const pixel = ctx.getImageData(x, y, 1, 1).data;
        //const color3 = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        //console.log('image clicked', color3);
        console.log('image clicked', getPixelColor(x, y), " at ", x, ", ", y);
    }

    const getCoordinates = (x: number, y:number) => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext("2d");
        if (ctx === null) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const newx = (x - rect.left) * scaleX
        const newy = (y) * scaleY
        return {newx, newy}
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
                        onClick={handleImageClick}
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
                {/* Overlay for pins - fills the same area as the image and sits on top */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
                    {pins.map((pin, index) => {
                        // create nodeRef for each individual pin
                        // using createref here because the number of pins can change
                        // useref here results in "Rendered more hooks than during the previous render"
                        // when more pins are added
                        if (!pinRefs.current[pin.id]) pinRefs.current[pin.id] = React.createRef<HTMLDivElement>();
                        const pinRef = pinRefs.current[pin.id];

                        return (
                            <Draggable
                                key={pin.id ?? index}
                                axis='both'
                                bounds='parent'
                                defaultPosition={{ x: pin.positionX, y: pin.positionY }}
                                nodeRef={pinRef}
                                onDrag={(e: any, data:any) => handleDrag(e, data, pin.id)}
                                onStop={(e: any, data: any) => handleDragStop(e, data, pin.id)}
                            >
                                <div
                                    ref={pinRef}
                                    style={{
                                        position: 'absolute',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: 'red',
                                        borderRadius: '50%',
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