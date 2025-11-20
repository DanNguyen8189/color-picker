import React, { useState, useEffect, useRef } from 'react';
import { Pin } from '../Pin/Pin';
import type { RGB, ImagePin, Image } from "../../util";
import './PinOverlay.scss';
import { useCanvas } from '../../util/CanvasContext';

type PinOverlayProps = {
    count: number,

    setPinsParent: React.Dispatch<React.SetStateAction<ImagePin[]>>
}

// function PinOverlay({ count, canvasInstanceRef, setPinsParent }: PinOverlayProps) {
export const PinOverlay: React.FC<PinOverlayProps> = ({ count, setPinsParent }) => {
    // for keeping track of current canvas size for pin repositioning. Needed state to put in useEffect deps;
    // using canvasInstance.getBounds() directly in useEffect would cause it to fire on every render
    // size that technically would also track the getBounds() fn object
    const [bounds, setBounds] = useState<{width:number, height:number}>({width:0, height:0});
    // for finding the ratio of canvas size changes. Needs to be usesState
    // so it can properly trigger its useEffect when changed
    const [oldBounds, setOldBounds] = useState<{width:number, height:number}>({width:0, height:0});
    
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


    useEffect(() => {
        // attaches event listener 'canvasDrawn' once, when canvasInstanceRef.current becomes available
        if (!canvasInstance || typeof canvasInstance.on !== 'function') return;

        const syncBounds = () => {
            setBounds(prev =>{
                const canvasBounds = canvasInstance.getBounds();
                if (prev.width == canvasBounds.width && prev.height == canvasBounds.height){
                    return prev;
                }
                else{
                    //console.log('PinOverlay syncBounds set:', canvasBounds);
                    return canvasBounds
                }
            })
        };
        const handleCanvasDrawn = () => {
            // regenerate pins now that new canvas/image has been drawn
            // w/o this, pins remain in old positions/colors on the previous image

            syncBounds();
            generatePins(count);
        };

        // Listen for window resize
        const handleResize = () => {
            syncBounds();
        };


        // If this is a newly-created Canvas instance, call generatePins once
        // covers case where any image is uploaded for the first time. 
        // since we also want to generate pins the same time we attach the handler
        // if (attachedCanvasRef.current !== canvas) {
        //     attachedCanvasRef.current = canvas;
        //     generatePins(count);
        // }
        //generatePins(count);

        //generate pins when canvas is ready
        if (canvasInstance.getBounds().width > 0) {
            syncBounds();
            generatePins(count);
        }
        canvasInstance.on('canvasDrawn', handleCanvasDrawn);
        window.addEventListener('resize', handleResize);
        return () => {
            canvasInstance.off('canvasDrawn', handleCanvasDrawn);
            window.removeEventListener('resize', handleResize);
        };
    // count is needed here as a deps to ensure pins are regenerated.
    // without it, when a new image comes into play, the handleCanvasDrawn handler calls 
    // generatePins with a stale closure - in our case, whatever value count had when the 
    // effect first ran (1), every single time. So basically every time
    // we uploaded a new image, we'd start again with one pin until we dragged the count slider.
    // There was also a case where generatePins wouldn't get called at all and
    // pins from the previous image would persist on the new image
    }, [canvasInstance, count]);

    useEffect(() => {
        shiftPinPositions();
    }, [bounds]);

    useEffect(() => {
        //if (pins.length) setPinsParent(pins);
        setPinsParent(pins);
    }, [pins]);

    const handleDragStart = (id: string) => {
        setActivePinId(id);
    };

    // const handleDrag = (e: any, color:RGB, id:string) => {
    //     setPins(prevPins => prevPins.map(pin => {
    //         if (pin.id === id) {
    //             return {
    //                 ...pin,
    //                 color: color,
    //             };
    //         }
    //         return pin;
    //     }));
    // };
    const handleDrag = (e: any, pin: ImagePin) => {
        setPins(prevPins => prevPins.map(p => p.id === pin.id ? pin : p));
    };

    const handleDragStop = () => {
        setActivePinId(null);
    }

    const generatePins = (amount:number) => {
        if (!canvasInstance) return;
        if (bounds.width <= 0 || bounds.height <= 0) return;

        setPins(prev => {
            // remove extra pins
            if (prev.length > amount) {
                return prev.slice(0, amount);
            }

            // add missing pins
            if (prev.length < amount) {
                const newPins: ImagePin[] = [];
                for (let i = 0; i < amount - prev.length; i++) {
                    newPins.push( createPin() );
                }
                return [...prev, ...newPins];
            }

            // same length -> regenerate all pins
            if (prev.length === amount) {
                const newPins: ImagePin[] = [];
                for (let i = 0; i < amount; i++) {
                    newPins.push( createPin() );
                }
                return newPins;
            }

            return prev;
        });
    }

    const createPin = (): ImagePin => {
        const id = crypto && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : String(Date.now()) + Math.random().toString(36).slice(2,7);
        const positionX = Math.random() * bounds.width;
        const positionY = Math.random() * bounds.height;
        const newPin: ImagePin = {
            id: id,
            color: undefined,
            coordinates: {x: positionX, y: positionY}
        };
        return newPin;
    }

    const shiftPinPositions = () => {
        if (!canvasInstance) return;
        setOldBounds(bounds);
        // if (bounds.width === 0 || bounds.height === 0) return;
        // if (oldBounds.width === 0 || oldBounds.height === 0) return;
        // if (oldBounds.width === bounds.width && oldBounds.height === bounds.height) return;

        if ((bounds.width === 0 || bounds.height === 0) ||
            (oldBounds.width === 0 || oldBounds.height === 0) || 
            (oldBounds.width === bounds.width && oldBounds.height === bounds.height)) return;
        const xRatio = bounds.width / oldBounds.width;
        const yRatio = bounds.height / oldBounds.height;
        setPins(prev =>prev.map(pin => {
            return{
                ...pin,
                coordinates:{x: pin.coordinates.x * xRatio, y: pin.coordinates.y * yRatio}
            }
        }
        ))
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
                            onDrag={(e: any, updatedPin: ImagePin) => handleDrag(e, updatedPin)}
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