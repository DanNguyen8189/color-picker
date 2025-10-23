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
    canvasInstanceRef: React.RefObject<Canvas | null>,
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
        //console.log("canvas size ", canvasInstanceRef.current?.getDimensions());
        if (canvasInstanceRef == null) return;
        generatePins(count);
    }, [count]);

    // useEffect(() => {
    //     const canvas = canvasInstanceRef?.current;
    //     if (!canvas || typeof canvas.on !== 'function') return;

    //     const handleCanvasDrawn = () => {
    //         // regenerate pins now that the canvas/image has been drawn
    //         generatePins(count);
    //     };

    //     canvas.on('canvasDrawn', handleCanvasDrawn);
    //     return () => {
    //         canvas.off('canvasDrawn', handleCanvasDrawn);
    //     };
    // },[]);

    // for use in useEffect below, to cover case where image is uploaded for the first time
    const attachedCanvasRef = useRef<Canvas | null>(null);

    useEffect(() => {
        // attaches event listener 'canvasDrawn' once, when canvasInstanceRef.current becomes available
        const canvas = canvasInstanceRef?.current;
        if (!canvas || typeof canvas.on !== 'function') return;

        const handleCanvasDrawn = () => {
            // regenerate pins now that the canvas/image has been drawn
            // console.log("pins generating from canvasDrawn event");
            generatePins(count);
            // console.log("pins after generatePins in canvasDrawn event: ", pins);
        };

        // If this is a newly-created Canvas instance, call generatePins once
        // covers case where any image is uploaded for the first time. 
        // since we also want to generate pins the same time we attach the handler
        if (attachedCanvasRef.current !== canvas) {
            attachedCanvasRef.current = canvas;
            generatePins(count);
        }

        canvas.on('canvasDrawn', handleCanvasDrawn);
        return () => {
            canvas.off('canvasDrawn', handleCanvasDrawn);
        };
    }, [canvasInstanceRef?.current, count]);

    // useEffect(() =>{
    //     //generatePins(0);
    //     generatePins(count);
    // },[imgSrc]);

    // useEffect(() => {
    //     console.log("useeffect triggered in PinOverlay");
    //     if (!canvasInstanceRef?.current) return;
        
    //     // Only regenerate pins if canvas has valid dimensions
    //     const dimensions = canvasInstanceRef.current.getDragDimensions();
    //     // if (dimensions.width > 0 && dimensions.height > 0) {
    //     //     generatePins(count);
    //     // }
    //     generatePins(count);
    // }, [canvasInstanceRef?.current, count]);

    // }, [imgSrc, count]);
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
        setPins(prev => {
            const width = canvasInstanceRef.current!.getDragDimensions().width;
            const height = canvasInstanceRef.current!.getDragDimensions().height;

            // remove extra pins
            if (prev.length > amount) {
                for (let i = amount; i < prev.length; i++) {
                    delete pinRefs.current[prev[i].id];
                }
                return prev.slice(0, amount);
            }

            // add missing pins
            if (prev.length < amount) {
                const additions: ImagePin[] = [];
                for (let i = 0; i < amount - prev.length; i++) {
                    const id = crypto && typeof crypto.randomUUID === 'function'
                        ? crypto.randomUUID()
                        : String(Date.now()) + Math.random().toString(36).slice(2,7);
                    additions.push({
                        id,
                        positionX: Math.random() * width,
                        positionY: Math.random() * height,
                        draggable: true,
                    });
                }
                return [...prev, ...additions];
            }

            // same length -> regenerate all pins
            if (prev.length === amount) {
                for (let i = 0; i < prev.length; i++) {
                    delete pinRefs.current[prev[i].id];
                }
                const regenerated: ImagePin[] = [];
                for (let i = 0; i < amount; i++) {
                    const id = crypto && typeof crypto.randomUUID === 'function'
                        ? crypto.randomUUID()
                        : String(Date.now()) + Math.random().toString(36).slice(2,7);
                    regenerated.push({
                        id,
                        positionX: Math.random() * width,
                        positionY: Math.random() * height,
                        draggable: true,
                    });
                }
                return regenerated;
            }

            return prev;
        });
        console.log("pins after generatePins: ", pins);

        // //console.log("amount of current pins: ", pins.length, " amount to generate to: ", amount);
        // if (pins.length > amount) {
        //     console.log("deleting pins to: ", amount);
        //     for (let i = amount; i < pins.length; i++) {
        //         delete pinRefs.current[pins[i].id];
        //     }
        //     setPins(prev => prev.slice(0, amount ));
        //     //console.log("deleting pins to: ", amount);
        // }
        // else if (pins.length < amount) {

        //     console.log("adding pins from", pins.length, " to ", amount);
        //     const width = canvasInstanceRef.current.getDragDimensions().width;
        //     const height = canvasInstanceRef.current.getDragDimensions().height;

        //     for (let i = 0; i < amount - pins.length; i++) {
        //         const newPin: ImagePin = {
        //             id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
        //             positionX: (Math.random() * width), 
        //             positionY: (Math.random() * height), 
        //             draggable: true,
        //         };
        //         setPins(prev => [...prev, newPin]);
        //     }
        // }
        // else if (pins.length === amount){
        //     console.log("regenerating all pins");
        //     // want to regenerate all pins in this case

        //     for (let i = 0; i < amount; i++) {
        //         delete pinRefs.current[pins[i].id];
        //     }
        //     setPins([]);
        //     const width = canvasInstanceRef.current.getDragDimensions().width;
        //     const height = canvasInstanceRef.current.getDragDimensions().height;

            
        //     for (let i = 0; i < amount; i++) {
        //         const newPin: ImagePin = {
        //             id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
        //             positionX: (Math.random() * width), 
        //             positionY: (Math.random() * height), 
        //             draggable: true,
        //         };
        //         setPins(prev => [...prev, newPin]);
        //     }
        // }
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
                {/* <p>length of pins array: {pins.length}</p>
                <p>count var: {count}</p> */}
        </div>
    );
    
}
export default PinOverlay;