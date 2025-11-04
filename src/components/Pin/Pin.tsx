
import React from 'react';
// import Draggable from 'react-draggable';
import type { ImagePin } from '../Types';
import { Canvas } from '../../util';
import { useEffect, useState } from 'react';
//import { useColorPick } from '../../hooks/useColorPick';

type PinProps = {
    Draggable: any,  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    canvasInstanceRef: React.RefObject<Canvas | null>,
    pin: ImagePin,
    onDrag: (e: any, color: string, id:string) => void
}

export const Pin: React.FC<PinProps> = ({ Draggable, canvasInstanceRef, pin, onDrag }) => {
    // NodeRef required for react-draggable
    const [nodeRef, setNodeRef] = useState<React.RefObject<HTMLDivElement | null>>(React.createRef<HTMLDivElement>());
    const [color, setColor] = useState<string>('red');
    const [coordinates, setCoordinates] = useState<{x:number, y:number} | null>(null);

    useEffect(() => {
            const canvas = canvasInstanceRef.current;
            if (!canvas) return;
            const width = canvasInstanceRef.current!.getDragDimensions().width;
            const height = canvasInstanceRef.current!.getDragDimensions().height;

            const positionX = Math.random() * width;
            const positionY = Math.random() * height;
            // TODO block this? Ansync promise?
            //const color2 = useColorPick(canvasInstanceRef, {x:positionX, y:positionY}) || undefined;
            const c = canvas.getPixelColorFromDraggableCoordinates({x: positionX, y: positionY}) || 'red';
            setColor(c);
            setCoordinates({x: positionX, y: positionY});
            //setNodeRef(React.createRef<HTMLDivElement>());

            // cleanup function (runs when the component is unmounted)
            return () => {
                //console.log('Component is being destroyed!');
                //setNodeRef(React.createRef<HTMLDivElement>());
            };
    }, [canvasInstanceRef]);

    // const handleDrag = (e:any, data:any) => {
    //     if (canvasInstanceRef == null) return;
    //     const color = useColorPick(canvasInstanceRef, data);
    //     setColor(color || 'red');
    //     const newCoordinates = {x: data.x, y: data.y};
    //     setCoordinates(newCoordinates);
    // };

    const handleDrag = (e:any, data:any) => {
        // update controlled position and color on drag
        if (canvasInstanceRef == null) return;
        if (canvasInstanceRef.current == null) return;
        setCoordinates({ x: data.x, y: data.y });
        // if (canvas && typeof canvas.getPixelColor === 'function') {
        //     const c = canvas.getPixelColor({ x: data.x, y: data.y });
        //     setColor(c || 'red');
        // }
        //const c = useColorPick(canvasInstanceRef, data);
        const c = canvasInstanceRef.current.getPixelColorFromDraggableCoordinates({x: data.x, y: data.y}) || 'red';
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
                    backgroundColor: color || 'red',
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
                    backgroundColor: color || 'red',
                    borderRadius: '50%',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                }}
            />
        </Draggable>
    );
};