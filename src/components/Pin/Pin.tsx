
import React, { useEffect, useState } from 'react';
import type { ImagePin } from '../Types';
import { Canvas } from '../../util';
import { rgbToString, type RGB } from '../Types';

type PinProps = {
    //Draggable: any,  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    Draggable: typeof import('react-draggable')['default'] | undefined,
    canvasInstanceRef: React.RefObject<Canvas | null>,
    pin: ImagePin,
    onDrag: (e: any, color: RGB, id:string) => void
}

export const Pin: React.FC<PinProps> = ({ Draggable, canvasInstanceRef, pin, onDrag }) => {
    // NodeRef required for react-draggable
    const [nodeRef, setNodeRef] = useState<React.RefObject<HTMLDivElement | null>>(React.createRef<HTMLDivElement>());
    //const [color, setColor] = useState<string>('red');
    const [color, setColor] = useState<{r: number, g: number, b: number} | undefined>(undefined);
    const [coordinates, setCoordinates] = useState<{x:number, y:number} | undefined>(undefined);

    useEffect(() => {
            if (!canvasInstanceRef?.current) {
                // optional chaining operator ? checks both ref and current prop
                // at same time
                return;
            }
            
            const canvas = canvasInstanceRef.current;
            const { width, height } = canvas.getDragDimensions();

            const positionX = Math.random() * width;
            const positionY = Math.random() * height;

            // TODO block this? Ansync promise?
            //const color2 = useColorPick(canvasInstanceRef, {x:positionX, y:positionY}) || undefined;
            const c = canvas.getPixelColorFromDraggableCoordinates({
                x: positionX,
                y: positionY
            }) || {r:0, g:0, b:0};

            setColor(c);
            setCoordinates({x: positionX, y: positionY});
            onDrag(undefined, c, pin.id);
            //setNodeRef(React.createRef<HTMLDivElement>());

            // cleanup function (runs when the component is unmounted)
            return () => {
                //console.log('Component is being destroyed!');
                //setNodeRef(React.createRef<HTMLDivElement>());
            };
    }, [canvasInstanceRef]);

    const handleDrag = (e:any, data:{x: number, y:number}) => {
        // update controlled position and color on drag
        if (!canvasInstanceRef?.current) {
            return;
        }
        
        const canvas = canvasInstanceRef.current;
        const { x, y } = data;
        setCoordinates({ x, y });

        const c = canvas.getPixelColorFromDraggableCoordinates({x, y}) || {r:0, g:0, b:0};
        setColor(c);
        onDrag(e, c, pin.id);
    };

    if (!coordinates) return null;

    // Return static pin while Draggable is loading
    if (!Draggable) {
        return (
            <div
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    width: '15px',
                    height: '15px',
                    border: '2px solid white',
                    backgroundColor: rgbToString(color) || 'red',
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
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    width: '15px',
                    height: '15px',
                    border: '2px solid white',
                    backgroundColor: rgbToString(color)  || 'red',
                    borderRadius: '50%',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                }}
            />
        </Draggable>
    );
};