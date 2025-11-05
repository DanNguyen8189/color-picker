import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '../../util';
import { Pin }from '../Pin/Pin';

import type { ImagePin } from "../Types";
import { set } from 'astro:schema';

type PinOverlayProps = {
    count: number,
    canvasInstanceRef: React.RefObject<Canvas | null>,
    setPinsParent: React.Dispatch<React.SetStateAction<ImagePin[]>>
}

// function PinOverlay({ count, canvasInstanceRef, setPinsParent }: PinOverlayProps) {
export const PinOverlay: React.FC<PinOverlayProps> = ({ count, canvasInstanceRef, setPinsParent }) => {
    const [pins, setPins] = useState<ImagePin[]>([]);

    const [Draggable, setDraggable] = useState<typeof import('react-draggable')['default'] | null>(null);
    // Dynamically import react-draggable to avoid SSR issues

    useEffect(() => {
        let mounted = true; // prevent calling setState on unmounted component
        import('react-draggable')
            .then((module) => {
                if (!mounted) return;

                // take returned module and assign to Draggable state
                // react-draggable's defult export is the Draggable component itself
                const reactDraggableComponent = (module as any).default ?? (module as any);
                // ESM: component is in default export
                // CommonJS: component is the module itself
                // mod could be either type, depending on the build system
                // so types re unkown at compile time


                // wrap in a function so React doesn't try call it during assignment, which causes
                // “Class constructor … cannot be invoked without 'new'”
                setDraggable(() => reactDraggableComponent as typeof import('react-draggable')['default']);
            }).catch((err) => {
                console.error('Error importing react-draggable', err);
                setDraggable(null);
            });
        return () => { mounted = false; };
    }, []);


    // for use in useEffect below, to cover case where image is uploaded for the first time
    //const attachedCanvasRef = useRef<Canvas | null>(null);

    useEffect(() => {
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

    const handleDrag = (e: any, color:{r: number, g: number, b: number}, id:string) => {
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
        if (!canvasInstanceRef?.current) {
            return;
        }

        setPins(prev => {

            // remove extra pins
            if (prev.length > amount) {
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