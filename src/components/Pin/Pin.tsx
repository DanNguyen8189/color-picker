
import React, { useEffect, useState, useRef } from 'react';
import { Canvas, rgbToString } from '../../util';
import type { ImagePin, RGB, Coordinates } from '../../util';
import { useCanvas } from '../../util/CanvasContext';
import './Pin.scss';
import { DraggableData } from 'react-draggable';

type PinProps = {
    //Draggable: any,  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    Draggable: typeof import('react-draggable')['default'] | null,
    pin: ImagePin,
    onStart: () => void
    onDrag: (e: any, pin: ImagePin) => void
    onStop: () => void
    isDimmed: boolean
}

export const Pin: React.FC<PinProps> = ({ Draggable, pin, onStart, onDrag, onStop, isDimmed }) => {
    // NodeRef required for react-draggable
    const nodeRef = useRef<HTMLDivElement | null>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastColor, setLastColor] = useState<RGB | undefined>(pin.color);

    const { canvasInstance, imageObjectUrlRef } = useCanvas();

    const getBounds = (): { left: number; right: number; top: number; bottom: number } => {
        if (!canvasInstance) return { left: 0, right: 0, top: 0, bottom: 0 };
        const { width, height } = canvasInstance.getBounds();
        return { left: 0, right: width, top: 0, bottom: height };
    };

    const zoomedPinSize = 60;
    const defaultPinSize = 15;
    const getPinSize = ():number => (isDragging ? zoomedPinSize : defaultPinSize);

    // Pin is enlarged and shows a zoomed in version of the canvas image when being
    // dragged; this returns css for it
    const getZoomStyle = (coords: Coordinates): React.CSSProperties => {
        if (!canvasInstance || !imageObjectUrlRef.current) return {};
        const { width, height } = canvasInstance.getBounds();
        if (width <= 0 || height <= 0) return {};
        const zoom = 4;           
        const zoomedBGWidth = width * zoom; 
        const zoomedBGHeight = height * zoom;
        const zoomedX = coords.x * zoom;
        const zoomedY = coords.y * zoom;
        //account for pin sizes
        const x = -(zoomedX - zoomedPinSize / 2);
        const y = -(zoomedY - zoomedPinSize / 2);
        const topBorderColor = lastColor ? rgbToString(lastColor) : 'white';
        const bottomBorderColor = pin.color ? rgbToString(pin.color) : 'white';
        return {
            width: zoomedPinSize,
            height: zoomedPinSize,
            backgroundImage: `url(${imageObjectUrlRef.current})`,
            backgroundSize: `${zoomedBGWidth}px ${zoomedBGHeight}px`,
            backgroundPosition: `${x}px ${y}px`,
            backgroundRepeat: 'no-repeat',
            outline: `4px solid white`,
            borderWidth: '7px',
            borderStyle: 'solid',
            borderColor: `${topBorderColor} ${bottomBorderColor} ${bottomBorderColor} ${topBorderColor}`,
        };
    };

    const handleDragStart = (e: any) => {
        console.log("image:", imageObjectUrlRef.current);
        setIsDragging(true);
        onStart();
    }

    const handleDrag = (e:any, data:DraggableData): void => {
        if (pin.coordinates && data.x === pin.coordinates.x && data.y === pin.coordinates.y) return;
        const updatedPin: ImagePin = {
            ...pin,
            coordinates:{x: data.x, y: data.y}
        }  
        onDrag(e, updatedPin);
    };

    const handleDragStop = (e: any) => {
        setLastColor(pin.color);
        setIsDragging(false);
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
            //bounds='parent'
            bounds={getBounds()}
            //defaultPosition={pin.coordinates}
            position={pin.coordinates}
            //so that data.x and data.y are relative to the pin's center vs default top left
            positionOffset={{ x: -getPinSize() / 2, y: -getPinSize() / 2 }}
            nodeRef={nodeRef}
            onStart={handleDragStart}
            onDrag={handleDrag}
            onStop={handleDragStop}
        >
            <div
                className={`pin ${isDragging ? 'pin-active' : ''}`}
                data-testid='pin-with-draggable'
                ref={nodeRef}
                style={{
                    width: getPinSize(),
                    height: getPinSize(),
                    backgroundColor: !isDragging && pin.color ? rgbToString(pin.color) : 'transparent',
                    opacity: isDimmed ? 0.3 : 1,
                    // When pin is stationary, show just color. when dragging, show zoomed image
                    ...(isDragging && pin.coordinates ? getZoomStyle(pin.coordinates) : {}),
                } as React.CSSProperties}
            />
        </Draggable>
    );
};