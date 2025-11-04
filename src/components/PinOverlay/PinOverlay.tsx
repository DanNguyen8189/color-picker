import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '../../util';
import { Pin }from '../Pin/Pin';

import type { ImagePin } from "../Types";
// function Slider({handleSlide}: {handleSlide: (value:number) => void})
type PinOverlayProps = {
    count: number,
    //canvasRef: React.RefObject<HTMLCanvasElement | null>
    //canvas: Canvas | null
    canvasInstanceRef: React.RefObject<Canvas | null>,
    setPinsParent: React.Dispatch<React.SetStateAction<ImagePin[]>>
}

// function PinOverlay({ count, canvasInstanceRef, setPinsParent }: PinOverlayProps) {
export const PinOverlay: React.FC<PinOverlayProps> = ({ count, canvasInstanceRef, setPinsParent }) => {
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


    // useEffect(() =>{
    //     if (!canvasInstanceRef?.current) {
    //         return;
    //     }

    //     generatePins(count);
    // }, [count]);

    // for use in useEffect below, to cover case where image is uploaded for the first time
    //const attachedCanvasRef = useRef<Canvas | null>(null);

    useEffect(() => {
        console.log("PinOverlay useEffect for canvasDrawn, count: ", count);
        // attaches event listener 'canvasDrawn' once, when canvasInstanceRef.current becomes available
        const canvas = canvasInstanceRef?.current;
        if (!canvas || typeof canvas.on !== 'function') return;

        const handleCanvasDrawn = () => {
            // regenerate pins now that new canvas/image has been drawn
            // w/o this, pins remain in old positions/colors on the previous image
            generatePins(count);
        };

        // If this is a newly-created Canvas instance, call generatePins once
        // covers case where any image is uploaded for the first time. 
        // since we also want to generate pins the same time we attach the handler
        // if (attachedCanvasRef.current !== canvas) {
        //     attachedCanvasRef.current = canvas;
        //     generatePins(count);
        // }
        //generatePins(count);

        //generate pins when count changes (and canvas is ready)
        if (canvas.getDragDimensions().width > 0) generatePins(count);

        canvas.on('canvasDrawn', handleCanvasDrawn);
        return () => {
            canvas.off('canvasDrawn', handleCanvasDrawn);
        };
    }, [canvasInstanceRef?.current, count]);
    /**
     * count is needed in deps; without it, number of pins appearing on canvas 
     * reverts to 1 on image switch. This is because the useEffect contains a 
     * closure over the count variable in the handleCanvasDrawn function,
     * which keeps the value of count at the time the effect was created (1). 
     * Adding count here ensures the effect is re-run whenever count changes,
    */

    // pass up pin changes to parent
    useEffect(() => {   
        setPinsParent(pins);
    }, [pins]);

    const handleDrag = (e:any, color:string, id:string) => {
        setPins(prevPins => prevPins.map(pin => {
            if (pin.id === id) {
                return {
                    ...pin,
                    color: color,
                };
            }
            return pin;
        }));
    };
    
    const generatePins = (amount:number) => {
        console.log("generatePins called with amount: ", amount);
        if (!canvasInstanceRef?.current) {
            return;
        }

        setPins(prev => {

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

                    newPins.push({
                        id: id,
                        positionX: 0,
                        positionY: 0,
                        color: undefined,
                    });
                }
                return [...prev, ...newPins];
            }

            // same length -> regenerate all pins
            if (prev.length === amount) {
                const newPins: ImagePin[] = [];
                for (let i = 0; i < amount; i++) {
                    const id = crypto && typeof crypto.randomUUID === 'function'
                        ? crypto.randomUUID()
                        : String(Date.now()) + Math.random().toString(36).slice(2,7);
                    newPins.push({
                        id: id,
                        positionX: 0,
                        positionY: 0,
                        color: undefined,
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
                        return (
                            <Pin
                                key={pin.id ?? index}
                                Draggable={Draggable}
                                canvasInstanceRef={canvasInstanceRef}
                                pin={pin}
                                onDrag={(e: any, data: any) => handleDrag(e, data, pin.id)}
                            />
                        );
                    })}
                </div>
        </div>
    );
    
}
// export default PinOverlay;