
import React, { useEffect, useState } from 'react';
import { Canvas, rgbToString } from '../../util';
import type { ImagePin, RGB, Coordinates } from '../../util';
import './Pin.scss';
import { useCanvas } from '../../util/';

type PinProps = {
    //Draggable: any,  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    Draggable: typeof import('react-draggable')['default'] | null,
    pin: ImagePin,
    onDragStart: () => void
    onDrag: (e: any, color: RGB, id:string) => void
    onDragStop: () => void
    isActive: boolean
}

export const Pin: React.FC<PinProps> = ({ Draggable, pin, onDragStart, onDrag, onDragStop, isActive }) => {
    // NodeRef required for react-draggable
    const [nodeRef, setNodeRef] = useState<React.RefObject<HTMLDivElement | null>>(React.createRef<HTMLDivElement>());
    //const [color, setColor] = useState<string>('red');
    const [color, setColor] = useState<RGB | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

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
            if (!canvasInstance) {
                // optional chaining operator ? checks both ref and current prop
                // at same time
                return;
            }
            
            const canvas = canvasInstance;
            const { width, height } = canvas.getBounds();

            if (width === 0 || height === 0) return;

            const positionX = Math.random() * width;
            const positionY = Math.random() * height;
            setCoordinates({x: positionX, y: positionY});

            const color = readColorSafe(canvas, { x: positionX, y: positionY });

            if (color){
                setColor(color);
                //onDrag(undefined, color, pin.id);
               // Defer notifying parent to avoid sync re-mount loops
               //this ondrag call updates parent state, which remounts pin
               // which reruns the effect, causing infinite loop
                requestAnimationFrame(() => onDrag(undefined, color, pin.id));
            }
            initializedRef.current = true;
    
            // cleanup function (runs when the component is unmounted)
            return () => {
                //console.log('Component is being destroyed!');
            };
    }, [canvasInstance]);

    const handleDrag = (e:any, data:Coordinates): void => {
        // update controlled position and color on drag
        if (!canvasInstance) return;

        //prevents updates that might cause rerender infinite loops in testing
        //setCoordinates -> rerenders Pin -> mock calls ondrag again -> setcoordinates called
        // again
        if (coordinates && data.x === coordinates.x && data.y === coordinates.y) return;
        
        const canvas = canvasInstance;
        const newColor = readColorSafe(canvas, { x: data.x, y: data.y });;
        setCoordinates({ x:data.x, y:data.y });

        // Keep last known color if read fails
        const next = newColor ?? color;
        if (next) {
            setColor(next);
            onDrag(e, next, pin.id);
        }
    };

    const handleDragStop = (e: any) => {
        onDragStop();
    };

    if (!coordinates) return null;

    // Return static pin while Draggable is loading
    if (!Draggable) {
        return (
            <div
                className="pin"
                data-testid='pin-without-draggable'
                ref={nodeRef}
                style={{
                    '--pin-color': color ? rgbToString(color) : 'transparent',
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
            defaultPosition={{ x: coordinates.x, y: coordinates.y }}
            nodeRef={nodeRef}
            onStart={onDragStart}
            onDrag={handleDrag}
            onStop={handleDragStop}
        >
            <div
                className="pin"
                data-testid='pin-with-draggable'
                ref={nodeRef}
                style={{
                    '--pin-color': color ? rgbToString(color) : 'transparent',
                    '--pin-opacity': isActive ? 1 : 0.3
                } as React.CSSProperties}
            />
        </Draggable>
    );
};