
import React, { useEffect, useState } from 'react';
import { Canvas, rgbToString } from '../../util';
import type { ImagePin, RGB, Coordinates } from '../../util';

type PinProps = {
    //Draggable: any,  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    Draggable: typeof import('react-draggable')['default'] | null,
    canvasInstanceRef: React.RefObject<Canvas | null>,
    pin: ImagePin,
    onDrag: (e: any, color: RGB, id:string) => void
}

export const Pin: React.FC<PinProps> = ({ Draggable, canvasInstanceRef, pin, onDrag }) => {
    // NodeRef required for react-draggable
    const [nodeRef, setNodeRef] = useState<React.RefObject<HTMLDivElement | null>>(React.createRef<HTMLDivElement>());
    //const [color, setColor] = useState<string>('red');
    const [color, setColor] = useState<RGB | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

    const warnOnceRef = React.useRef(false); // per-pin instance ref that persists
    // across renders, to avoid spamming console with CORS warnings. 
    // A reg boolean would rerender the component every time
    
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
            if (!canvasInstanceRef?.current) {
                // optional chaining operator ? checks both ref and current prop
                // at same time
                return;
            }
            
            const canvas = canvasInstanceRef.current;
            const { width, height } = canvas.getBounds();

            if (width === 0 || height === 0) return;

            const positionX = Math.random() * width;
            const positionY = Math.random() * height;
            setCoordinates({x: positionX, y: positionY});

            const color = readColorSafe(canvas, { x: positionX, y: positionY });

            if (color){
                setColor(color);
                onDrag(undefined, color, pin.id);
            }
            // TODO call onDRag with fallback???
    
            // cleanup function (runs when the component is unmounted)
            return () => {
                //console.log('Component is being destroyed!');
            };
    }, [canvasInstanceRef]);

    const handleDrag = (e:any, data:Coordinates): void => {
        // update controlled position and color on drag
        if (!canvasInstanceRef?.current) return;

        //prevents updates that might cause rerender infinite loops in testing
        //setCoordinates -> rerenders Pin -> mock calls ondrag again -> setcoordinates called
        // again
        if (coordinates && data.x === coordinates.x && data.y === coordinates.y) return;
        
        const canvas = canvasInstanceRef.current;
        const newColor = readColorSafe(canvas, { x: data.x, y: data.y });;
        setCoordinates({ x:data.x, y:data.y });

        // Keep last known color if read fails
        const next = newColor ?? color;
        if (next) {
            setColor(next);
            onDrag(e, next, pin.id);
        }
    };

    if (!coordinates) return null;

    // Return static pin while Draggable is loading
    if (!Draggable) {
        return (
            <div
                data-testid='pin-without-draggable'
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    width: '15px',
                    height: '15px',
                    border: '2px solid white',
                    backgroundColor: color ? rgbToString(color) : 'transparent',
                    borderRadius: '50%',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    // left: pin.positionX,
                    // top: pin.positionY,
                    left: coordinates.x,
                    top: coordinates.y,
                }}
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
            onDrag={handleDrag}
        >
            <div
                data-testid='pin-with-draggable'
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    width: '15px',
                    height: '15px',
                    border: '2px solid white',
                    backgroundColor: color ? rgbToString(color) : 'transparent',
                    borderRadius: '50%',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                }}
            />
        </Draggable>
    );
};