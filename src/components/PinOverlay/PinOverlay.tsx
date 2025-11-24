import React, { useState, useEffect, useRef } from 'react';
import { Pin } from '../Pin/Pin';
import type { RGB, ImagePin, Image, Coordinates } from "../../util";
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

    const { canvasInstance, imageElement } = useCanvas();
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


    // useEffect(() => {
    //     // attaches event listener 'canvasDrawn' once, when canvasInstanceRef.current becomes available
    //     if (!canvasInstance || typeof canvasInstance.on !== 'function') return;

    //     const syncBounds = () => {
    //         setBounds(prev =>{
    //             const canvasBounds = canvasInstance.getBounds();
    //             if (prev.width == canvasBounds.width && prev.height == canvasBounds.height){
    //                 return prev;
    //             }
    //             else{
    //                 //console.log('PinOverlay syncBounds set:', canvasBounds);
    //                 return canvasBounds
    //             }
    //         })
    //     };
    //     const handleCanvasDrawn = () => {
    //         // regenerate pins now that new canvas/image has been drawn
    //         // w/o this, pins remain in old positions/colors on the previous image

    //         syncBounds();
    //         generatePins(count);
    //     };

    //     // Listen for window resize
    //     const handleResize = () => {
    //         syncBounds();
    //     };


    //     // If this is a newly-created Canvas instance, call generatePins once
    //     // covers case where any image is uploaded for the first time. 
    //     // since we also want to generate pins the same time we attach the handler
    //     // if (attachedCanvasRef.current !== canvas) {
    //     //     attachedCanvasRef.current = canvas;
    //     //     generatePins(count);
    //     // }
    //     //generatePins(count);

    //     //generate pins when canvas is ready
    //     if (canvasInstance.getBounds().width > 0) {
    //         syncBounds();
    //         generatePins(count);
    //     }
    //     canvasInstance.on('canvasDrawn', handleCanvasDrawn);
    //     window.addEventListener('resize', handleResize);
    //     return () => {
    //         canvasInstance.off('canvasDrawn', handleCanvasDrawn);
    //         window.removeEventListener('resize', handleResize);
    //     };
    // // count is needed here as a deps to ensure pins are regenerated.
    // // without it, when a new image comes into play, the handleCanvasDrawn handler calls 
    // // generatePins with a stale closure - in our case, whatever value count had when the 
    // // effect first ran (1), every single time. So basically every time
    // // we uploaded a new image, we'd start again with one pin until we dragged the count slider.
    // // There was also a case where generatePins wouldn't get called at all and
    // // pins from the previous image would persist on the new image
    // }, [canvasInstance, count]);

//    useEffect(() => {
//         if (!canvasInstance) return;
//         const handleResize = () => {
//             const canvasBounds = canvasInstance.getBounds();
//             setBounds(prev => 
//                 prev.width === canvasBounds.width && prev.height === canvasBounds.height
//                     ? prev
//                     : canvasBounds
//             );
//         };
//         const handleCanvasDrawn = () => {
//             // regenerate pins now that new canvas/image has been drawn
//             // w/o this, pins remain in old positions/colors on the previous image

//             generatePins(count);
//         };
//         window.addEventListener('resize', handleResize);
//         canvasInstance.on('canvasDrawn', handleCanvasDrawn);
//         return () => {
//             canvasInstance.off('canvasDrawn', handleCanvasDrawn);
//             window.removeEventListener('resize', handleResize)
//         };
//    }, [canvasInstance, count]);

//     useEffect(() => {
//         if (!imageElement) return;
//         if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
//             setBounds({
//                 width: imageElement.naturalWidth,
//                 height: imageElement.naturalHeight
//             });
//         }
//     }, [imageElement]);

//     // // If bounds got set from imageElement and no pins yet, generate them
//     // useEffect(() => {
//     //     if (bounds.width > 0 && bounds.height > 0 && canvasInstance) {
//     //         generatePins(count);
//     //     }
//     // }, [bounds, canvasInstance, count]);
//     // If bounds got set from imageElement and no pins yet, generate them
//     // useEffect(() => {
//     //     if (bounds.width > 0 && bounds.height > 0 && canvasInstance) {
//     //         generatePins(count);
//     //     }
//     // }, [canvasInstance, count]);

//     useEffect(() => {
//         shiftPinPositions();
//     }, [bounds]);

    useEffect(() => {
        // attaches event listener 'canvasDrawn' once, when canvasInstanceRef.current becomes available
        if (!canvasInstance || typeof canvasInstance.on !== 'function') return;

        const syncBounds = () => {
            //setOldBounds(bounds);
            setBounds(prev =>{
                const canvasBounds = canvasInstance.getBounds();
                if (prev.width == canvasBounds.width && prev.height == canvasBounds.height){
                    return prev;
                }
                else{
                    console.log('PinOverlay syncBounds set:', canvasBounds);
                    return canvasBounds
                }
            })
        };
        const handleCanvasDrawn = () => {
            // regenerate pins now that new canvas/image has been drawn
            // w/o this, pins remain in old positions/colors on the previous image

            syncBounds();
            //console.log("generating pins on canvas drawn, count:", count);
            generatePins(count);
        };

        // Listen for window resize
        const handleResize = () => {
            syncBounds();
        };

        //generate pins when canvas is ready
        if (canvasInstance.getBounds().width > 0) {
            syncBounds();
            console.log("generating pins on canvas ready, count:", count);
            generatePins(count);
        }
        canvasInstance.on('canvasDrawn', handleCanvasDrawn);
        window.addEventListener('resize', handleResize);
        return () => {
            canvasInstance.off('canvasDrawn', handleCanvasDrawn);
            window.removeEventListener('resize', handleResize);
        };
    }, [canvasInstance, count]);

    // useEffect(() =>{
    //     if (bounds.width > 0 && bounds.height > 0) {
    //         generatePins(count);
    //     }
    // }, [count]);

    // useEffect(() => {
    //     shiftPinPositions();
    //     console.log("pins shifted", pins.map(p => p.coordinates));
    // }, [bounds]);

    useEffect(() => {
        //if (pins.length) setPinsParent(pins);
        setPinsParent(pins);
        console.log("canvas size in pinoverlay", bounds);
        console.log("pins in pinoverlay", pins);
    }, [pins]);

    const handleDragStart = (id: string) => {
        setActivePinId(id);
    };

    const warnOnceRef = React.useRef(false); // per-pin instance ref that persists
    // across renders, to avoid spamming console with CORS warnings. 
    // A reg boolean would rerender the component every time
    const readColorSafe = (coords: Coordinates): RGB | undefined => {
        if (!canvasInstance) return undefined;
        try {
            return canvasInstance.getPixelColor(coords);
        } catch (e) {
            if (!warnOnceRef.current) {
                console.warn('Pixel read failed (canvas possibly not ready or CORS-related).', e);
                warnOnceRef.current = true;
            }
            return undefined;
        }
    };
    const handleDrag = (e: any, pin: ImagePin) => {
        // update controlled position and color on drag
        if (!canvasInstance) return;

        //prevents updates that might cause rerender infinite loops in testing
        //setCoordinates -> rerenders Pin -> mock calls ondrag again -> setcoordinates called
        // again
        const coordinates = pin.coordinates;
        
        const newColor = readColorSafe(coordinates);;

        if (newColor && newColor !== pin.color){
            const updatedPin: ImagePin = {
                ...pin,
                color: newColor,
            }
            setPins(prevPins => prevPins.map(p => p.id === pin.id ? updatedPin : p));
        }
    };

    const handleDragStop = () => {
        setActivePinId(null);
    }

    const generatePins = (amount:number) => {
        console.log("generating pins:", amount);
        if (!canvasInstance) return;
        //if (bounds.width <= 0 || bounds.height <= 0) return;
        if (canvasInstance.getBounds().width <= 0 || canvasInstance.getBounds().height <= 0) return;

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
        if (!canvasInstance) throw new Error("Canvas instance not available when creating pin.");
        const id = crypto && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : String(Date.now()) + Math.random().toString(36).slice(2,7);
        const positionX = Math.random() * canvasInstance.getBounds().width;
        const positionY = Math.random() * canvasInstance.getBounds().height;
        const color = readColorSafe( {x: positionX, y: positionY} );
        const newPin: ImagePin = {
            id: id,
            color: color,
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
                            isDimmed={activePinId == null ? false : !(activePinId === pin.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
// export default PinOverlay;