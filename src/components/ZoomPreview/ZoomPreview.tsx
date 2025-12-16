//import React from 'react';
import { useState } from 'react';
import { useCanvas, rgbToString } from '../../util';
import type { ImagePin, RGB, Coordinates } from '../../util';
import './ZoomPreview.scss';

// Component that shows a zoomed-in preview of the area around a currently active pin

export interface ZoomPreviewProps {
    pin: ImagePin;
}

export const getZoomStyle = (windowSize: number, pin: ImagePin, lastColor: RGB | undefined, canvasInstance: any, imageObjectUrlRef: React.RefObject<string | null>): React.CSSProperties => {
    if (!canvasInstance || !imageObjectUrlRef || !imageObjectUrlRef.current) return {};
    //const windowSize = 80;
    const { width, height } = canvasInstance.getBounds();
    if (width <= 0 || height <= 0) return {};
    const zoom = 6;           
    const zoomedBGWidth = width * zoom; 
    const zoomedBGHeight = height * zoom;
    const zoomedX = pin.coordinates.x * zoom;
    const zoomedY = pin.coordinates.y * zoom;
    //account for pin sizes
    //TODO harded 6px for accuracy, find source of offset later?
    const x = -(zoomedX - windowSize / 2) - 6;
    const y = -(zoomedY - windowSize / 2) - 6;
    const topBorderColor = lastColor ? rgbToString(pin.color) : 'white';
    const bottomBorderColor = pin.color ? rgbToString(lastColor) : 'white';
    return {
        width: windowSize,
        height: windowSize,
        backgroundImage: `url(${imageObjectUrlRef.current})`,
        backgroundSize: `${zoomedBGWidth}px ${zoomedBGHeight}px`,
        backgroundPosition: `${x}px ${y}px`,
        borderColor: `${topBorderColor} ${bottomBorderColor} ${bottomBorderColor} ${topBorderColor}`,
    };
};

export const ZoomPreview: React.FC<ZoomPreviewProps> = ({pin}) => {
    if (!pin) return <div></div>;
    const { canvasInstance, imageObjectUrlRef } = useCanvas();
    //const [lastColor, setLastColor] = useState<RGB | undefined>(pin.color);

    return (
        // <div className="zoom-preview" style={getZoomStyle(pin.coordinates)}></div>
<div className="zoom-preview" style={getZoomStyle(100, pin, pin.color, canvasInstance, imageObjectUrlRef)}></div>
    );
}