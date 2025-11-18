
import React, { useEffect, useState, useRef, use } from 'react';
import { Canvas, rgbToString } from '../../util';
import type { ImagePin, RGB, Coordinates } from '../../util';
import { useCanvas } from '../../util/CanvasContext';
import './Pin.scss';
import { DraggableData } from 'react-draggable';
import { read } from 'fs';
import { on } from 'events';

type PinProps = {
    //Draggable: any,  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    Draggable: typeof import('react-draggable')['default'] | null,
    pin: ImagePin,
    onStart: () => void
    onDrag: (e: any, pin: ImagePin) => void
    onStop: () => void
    isActive: boolean
}

export const Pin: React.FC<PinProps> = ({ Draggable, pin, onStart, onDrag, onStop, isActive }) => {
    // NodeRef required for react-draggable
    const nodeRef = useRef<HTMLDivElement | null>(null);

    //const [color, setColor] = useState<string>('red');
    // const [color, setColor] = useState<RGB | undefined>(undefined);
    // const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

    //const [currentPin, setCurrentPin] = useState<ImagePin>(pin);

    const warnOnceRef = React.useRef(false); // per-pin instance ref that persists
    // across renders, to avoid spamming console with CORS warnings. 
    // A reg boolean would rerender the component every time

    const { canvasInstance } = useCanvas();
    const initializedRef = React.useRef(false);
    
    const readColorSafe = (canvas: Canvas, coords: Coordinates): RGB | undefined => {
        try {
            return canvas.getPixelColor(coords);
        } catch (e) {
            if (!warnOnceRef.current) {
                console.warn('Pixel read failed (canvas possibly not ready or CORS-related).', e);
                warnOnceRef.current = true;
            }
            return undefined;
        }
    };

    useEffect(() => {
        if (initializedRef.current || !canvasInstance || !pin.coordinates) {
            return;
        }

        const color = readColorSafe(canvasInstance, pin.coordinates);

        if (color){
            //setColor(color);
            //setCurrentPin({...pin, color: color});
            //onDrag(undefined, color, pin.id);
            // Defer notifying parent to avoid sync re-mount loops
            //this ondrag call updates parent state, which remounts pin
            // which reruns the effect, causing infinite loop
            //requestAnimationFrame(() => onDrag(undefined, {...pin, color: color}));
            onDrag(undefined, {...pin, color: color})
        }
        initializedRef.current = true;

        // cleanup function (runs when the component is unmounted)
        return () => {
            //console.log('Component is being destroyed!');
        };
    }, [canvasInstance, onDrag, pin.coordinates?.x, pin.coordinates?.y]);

    const handleDrag = (e:any, data:DraggableData): void => {
        // update controlled position and color on drag
        if (!canvasInstance) return;

        //prevents updates that might cause rerender infinite loops in testing
        //setCoordinates -> rerenders Pin -> mock calls ondrag again -> setcoordinates called
        // again
        const coordinates = pin.coordinates;
        if (coordinates && data.x === coordinates.x && data.y === coordinates.y) return;
        
        const canvas = canvasInstance;
        const newColor = readColorSafe(canvas, { x: data.x, y: data.y });;

        if (newColor && newColor !== pin.color){
            const updatedPin: ImagePin = {
                ...pin,
                color: newColor,
                coordinates:{x: data.x, y: data.y}
            }
            //setCurrentPin(updatedPin);
            onDrag(e, updatedPin);
        }
        else {
            const updatedPin: ImagePin = {
                ...pin,
                coordinates:{x: data.x, y: data.y}
            }
            //setCurrentPin(updatedPin);
            onDrag(e, updatedPin);
        }
    };

    const handleDragStop = (e: any) => {
        onStop();
    };

    if (!pin.coordinates) return null;

    // Return static pin while Draggable is loading
    if (!Draggable) {
        return (
            <div
                className="pin"
                data-testid='pin-without-draggable'
                ref={nodeRef}
                style={{
                    '--pin-color': pin.color ? rgbToString(pin.color) : 'transparent',
                    // Inline fallback so tests/SSR see correct color without SCSS
                    backgroundColor: pin.color ? rgbToString(pin.color) : 'transparent',
                } as React.CSSProperties}
            />
        );
    }

    // Once Draggable is loaded, return draggable pin
    return (
        <Draggable
            key={pin.id}
            axis='both'
            bounds='parent'
            //defaultPosition={pin.coordinates}
            position={pin.coordinates}
            nodeRef={nodeRef}
            onStart={onStart}
            onDrag={handleDrag}
            onStop={handleDragStop}
        >
            <div
                className="pin"
                data-testid='pin-with-draggable'
                ref={nodeRef}
                style={{
                    '--pin-color': pin.color ? rgbToString(pin.color) : 'transparent',
                    '--pin-opacity': isActive ? 1 : 0.3,
                    backgroundColor: pin.color ? rgbToString(pin.color) : 'transparent',
                    opacity: isActive ? 1 : 0.3,
                } as React.CSSProperties}
            />
        </Draggable>
    );
};