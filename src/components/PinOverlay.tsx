import React, { useState, useEffect, useRef, use } from 'react';
import { Canvas, loadImageHandler } from '../util';
import { useColorPick } from '../hooks/useColorPick';

import type { ImagePin } from "./Types";
// function Slider({handleSlide}: {handleSlide: (value:number) => void})
type PinOverlayProps = {
    pins2: ImagePin[],
    count: number,
    //canvasRef: React.RefObject<HTMLCanvasElement | null>
    //canvas: Canvas | null
    canvasInstanceRef: React.RefObject<Canvas | null>
}

function PinOverlay({ pins2, count, canvasInstanceRef }: PinOverlayProps) {
    const [pins, setPins] = useState<ImagePin[]>([]);

    // map of node refs for each pin so react-draggable can use nodeRef per draggable
    const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

    const [Draggable, setDraggable] = useState<any>(null);
    // Dynamically import react-draggable to avoid SSR issues
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

    useEffect(() =>{
        console.log("canvas size ", canvasInstanceRef.current?.getDimensions());
        if (canvasInstanceRef == null) return;
        generatePins(count);
    }, [count])


    // const handleDrag = (e:any, data:any, id:string) => {
    //     e.preventDefault();
    //     //setDraggedPinId(id);
    //     //setPins(prev => prev.map(pin => pin.id === id ? { ...pin, positionX, positionY } : pin));


    //     const canvas = new Canvas(canvasRef.current!);
        
    //     console.log('position from draggable', id, data.x, data.y);
    //     //console.log('color picked', color, coordinates, dimensions);
    //     const coordinates = {x: data.x, y: data.y};
    //     const canvasCordinates = canvas.getCanvasCoordinates(coordinates) ?? {x:0, y:0};
    //     // if (newx === undefined || newy === undefined) return;

    //     //console.log("color from useColorPick: ", getPixelColor(newx, newy));
    //     console.log("color from useColorPick: ", canvas.getPixelColor(canvasCordinates));
    // }
    
    const handleDrag = (e:any, data:any, id:string) => {
        if (canvasInstanceRef == null) return;
        const color = useColorPick(canvasInstanceRef, e, data, id);
    }
    
    const generatePins = (amount:number) => {
        if (canvasInstanceRef == null) return;
        if (canvasInstanceRef.current == null) return;
        console.log("amount of current pins: ", pins.length, " amount to generate to: ", amount);
        if (pins.length > amount) {
            for (let i = amount; i < pins.length; i++) {
                delete pinRefs.current[pins[i].id];
            }
            setPins(prev => prev.slice(0, amount));
            console.log("deleting pins to: ", amount);
        }
        else if (pins.length < amount) {
            console.log("hmm")
            // generate pins at random locations within the image bounds
            // const rect = canvas.getBoundingClientRect();
            // const width = rect.width;
            // const height = rect.height;
            //const width = canvasInstanceRef.current.getDimensions().width;
            //const height = canvasInstanceRef.current.getDimensions().height;
            const width = canvasInstanceRef.current.getDragDimensions().width;
            const height = canvasInstanceRef.current.getDragDimensions().height;
            console.log("canvas size in generatePins: ", width, height);

            for (let i = 0; i < amount - pins.length; i++) {
                const newPin: ImagePin = {
                    id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
                    positionX: (Math.random() * width), 
                    positionY: (Math.random() * height), 
                    draggable: true,
                };
                setPins(prev => [...prev, newPin]);
            }
        }
        console.log("pins after generatePins: ", pins);
    }
    
    return (
        <div>
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
                                onDrag={(e: any, data: any) => handleDrag(e, data, pin.id)}
                                //onStop={(e: any, data: any) => handleDrag(canvasRef, e, data, pin.id)}
                            >
                                <div
                                    ref={pinRef}
                                    style={{
                                        position: 'absolute',
                                        width: '10px',
                                        height: '10px',
                                        border: '2px solid white',
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
    );
    
}
export default PinOverlay;