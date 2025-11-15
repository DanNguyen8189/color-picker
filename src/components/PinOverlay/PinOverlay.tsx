import React, { useState, useEffect, useRef } from 'react';
import { Pin } from '../Pin/Pin';
import { Canvas } from '../../util';
import type { RGB, ImagePin } from "../../util";
import { set } from 'astro:schema';
import './PinOverlay.scss';
import { useCanvas } from '../../util';

type PinOverlayProps = {
    count: number,

    setPinsParent: React.Dispatch<React.SetStateAction<ImagePin[]>>
}

// function PinOverlay({ count, canvasInstanceRef, setPinsParent }: PinOverlayProps) {
export const PinOverlay: React.FC<PinOverlayProps> = ({ count, setPinsParent }) => {
    const [pins, setPins] = useState<ImagePin[]>([]);

    const [activePinId, setActivePinId] = useState<string | null>(null);

    const [Draggable, setDraggable] = useState<typeof import('react-draggable')['default'] | null>(null);
    // Dynamically import react-draggable to avoid SSR issues

    const { canvasInstance } = useCanvas();
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
        const canvas = canvasInstance;
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
        if (canvas.getBounds().width > 0) generatePins(count);

        canvas.on('canvasDrawn', handleCanvasDrawn);
        return () => {
            canvas.off('canvasDrawn', handleCanvasDrawn);
        };
    }, [canvasInstance, count]);
    /**
     * count is needed in deps; without it, number of pins appearing on canvas 
     * reverts to 1 on image switch. This is because the useEffect contains a 
     * closure over the count variable in the handleCanvasDrawn function,
     * which keeps the value of count at the time the effect was created (1). 
     * Adding count here ensures the effect is re-run whenever count changes,
    */

    useEffect(() => {
        //if (pins.length) setPinsParent(pins);
        setPinsParent(pins);
    }, [pins]);

    const handleDragStart = (id: string) => {
        setActivePinId(id);
    };

    const handleDrag = (e: any, color:RGB, id:string) => {
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

    const handleDragStop = () => {
        setActivePinId(null);
    }
    
    const generatePins = (amount:number) => {
        if (!canvasInstance) {
            return;
        }

        setPins(prev => {

            // remove extra pins
            if (prev.length > amount) {
                //setPinsParent(prev.slice(0, amount));
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
                        color: undefined,
                    });
                }
                //setPinsParent([...prev, ...newPins]);
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
                        color: undefined,
                    });
                }
                //setPinsParent(newPins);
                return newPins;
            }

            return prev;
        });
    }
    
    return (
        <div>
                {/* Overlay for pins - fills the same area as the image and sits on top */}
                <div 
                data-testid="pin-overlay-test"
                //style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
                className="pin-overlay"
                >
                    {pins.map((pin, index) => {
                        return (
                            <Pin
                                key={pin.id ?? index}
                                Draggable={Draggable}
                                pin={pin}
                                onStart={() => handleDragStart(pin.id)}
                                onDrag={(e: any, data: any) => handleDrag(e, data, pin.id)}
                                onStop={handleDragStop}
                                isActive={activePinId == null ? true : activePinId === pin.id}
                            />
                        );
                    })}
                </div>
        </div>
    );
    
}
// export default PinOverlay;