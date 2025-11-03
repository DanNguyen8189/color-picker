import React, { useState, useEffect, useRef, use } from 'react';
import { Canvas, loadImageHandler } from '../../util';
import { useColorPick } from '../../hooks/useColorPick';
import { Pin }from '../Pin/Pin';

import type { ImagePin } from "../Types";
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
    //const pinRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

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


    const handleDrag = (e:any, data:any, id:string) => {
        if (canvasInstanceRef == null) return;
        const color = useColorPick(canvasInstanceRef, data);
        setPins(prevPins => prevPins.map(pin => {
            if (pin.id === id) {
                return {
                    ...pin,
                    positionX: data.x,
                    positionY: data.y,
                    color: color,
                };
            }
            return pin;
        }));
    };
    
    const generatePins = (amount:number) => {
        if (canvasInstanceRef == null) return;
        if (canvasInstanceRef.current == null) return;

        setPins(prev => {
            const width = canvasInstanceRef.current!.getDragDimensions().width;
            const height = canvasInstanceRef.current!.getDragDimensions().height;

            // remove extra pins
            if (prev.length > amount) {
                // for (let i = amount; i < prev.length; i++) {
                //     delete pinRefs.current[prev[i].id];
                // }
                return prev.slice(0, amount);
            }

            // add missing pins
            if (prev.length < amount) {
                const newPins: ImagePin[] = [];
                for (let i = 0; i < amount - prev.length; i++) {
                    const id = crypto && typeof crypto.randomUUID === 'function'
                        ? crypto.randomUUID()
                        : String(Date.now()) + Math.random().toString(36).slice(2,7);
                    const positionX = Math.random() * width;
                    const positionY = Math.random() * height;
                    newPins.push({
                        id: id,
                        positionX: positionX,
                        positionY: positionY,
                        color: useColorPick(canvasInstanceRef, {x:positionX, y:positionY}) || undefined,
                    });
                }
                return [...prev, ...newPins];
            }

            // same length -> regenerate all pins
            if (prev.length === amount) {
                // for (let i = 0; i < prev.length; i++) {
                //     delete pinRefs.current[prev[i].id];
                // }
                const newPins: ImagePin[] = [];
                for (let i = 0; i < amount; i++) {
                    const id = crypto && typeof crypto.randomUUID === 'function'
                        ? crypto.randomUUID()
                        : String(Date.now()) + Math.random().toString(36).slice(2,7);
                    const positionX = Math.random() * width;
                    const positionY = Math.random() * height;
                    newPins.push({
                        id: id,
                        positionX: positionX,
                        positionY: positionY,
                        color: useColorPick(canvasInstanceRef, {x:positionX, y:positionY}) || undefined,
                    });
                }
                return newPins;
            }

            return prev;
        });
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
                        // if (!pinRefs.current[pin.id]) pinRefs.current[pin.id] = React.createRef<HTMLDivElement>();
                        // const pinRef = pinRefs.current[pin.id];

                        return (
                            // <Draggable
                            //     key={pin.id ?? index}
                            //     axis='both'
                            //     bounds='parent'
                            //     defaultPosition={{ x: pin.positionX, y: pin.positionY }}
                            //     nodeRef={pinRef}
                            //     onDrag={(e: any, data: any) => handleDrag(e, data, pin.id)}
                            //     //onStop={(e: any, data: any) => handleDrag(canvasRef, e, data, pin.id)}
                            // >
                            //     <div
                            //         ref={pinRef}
                            //         style={{
                            //             position: 'absolute',
                            //             width: '15px',
                            //             height: '15px',
                            //             border: '2px solid white',
                            //             backgroundColor: pin.color || 'red',
                            //             borderRadius: '50%',
                            //             zIndex: 9999,
                            //             pointerEvents: 'auto', // allow clicking/drags on the pin itself
                            //         }}
                            //     />
                            //     {/* {Pin(pinRef, pin)} */}
                            // </Draggable>
                            // <div key={pin.id ?? index}>
                            //     {Pin(pinRef, pin, {handleDrag})}
                            // </div>

                            <Pin
                                key={pin.id ?? index}
                                Draggable={Draggable}
                                canvasInstanceRef={canvasInstanceRef}
                                // pinRef={pinRef}
                                pin={pin}
                                onDrag={(e: any, data: any) => handleDrag(e, data, pin.id)}
                            />
                        );
                    })}
                </div>
                {/* <p>length of pins array: {pins.length}</p>
                <p>count var: {count}</p> */}
        </div>
    );
    
}
export default PinOverlay;