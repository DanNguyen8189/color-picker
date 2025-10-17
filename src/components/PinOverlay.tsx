import React, { useState, useEffect, useRef } from 'react';
import { Canvas, loadImageHandler } from '../util';

import type { ImagePin } from "./Types";
// function Slider({handleSlide}: {handleSlide: (value:number) => void})
type PinOverlayProps = {
    pins: ImagePin[],
    canvasRef: React.RefObject<HTMLCanvasElement | null>
    // handleDrag: (e: any, data: any, id: string) => void;
    // handleDragStop: (e: any, data: any, id: string) => void;
}

function PinOverlay({ pins, canvasRef }: PinOverlayProps) {
    // map of node refs for each pin so react-draggable can use nodeRef per draggable
    const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

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

    const handleDrag = (e:any, data:any, id:string) => {
        e.preventDefault();
        //setDraggedPinId(id);
        //setPins(prev => prev.map(pin => pin.id === id ? { ...pin, positionX, positionY } : pin));


        const canvas = new Canvas(canvasRef.current!);
        
        console.log('position from draggable', id, data.x, data.y);
        //console.log('color picked', color, coordinates, dimensions);
        const coordinates = {x: data.x, y: data.y};
        const canvasCordinates = canvas.getCanvasCoordinates(coordinates) ?? {x:0, y:0};
        // if (newx === undefined || newy === undefined) return;

        //console.log("color from useColorPick: ", getPixelColor(newx, newy));
        console.log("color from useColorPick: ", canvas.getPixelColor(canvasCordinates));
    }

    // const handleDragStop = (e: any, data: any, id: string) => {
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
                                onStop={(e: any, data: any) => handleDrag(e, data, pin.id)}
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