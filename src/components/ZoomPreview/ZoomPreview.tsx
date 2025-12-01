//import React from 'react';
import { useState } from 'react';
import { useCanvas, rgbToString } from '../../util';
import type { ImagePin, RGB, Coordinates } from '../../util';
import './ZoomPreview.scss';

export interface ZoomPreviewProps {
    pin: ImagePin;
}

export const getZoomStyle = (pin: ImagePin, lastColor: RGB | undefined, canvasInstance: any, imageObjectUrlRef: React.RefObject<string | null>): React.CSSProperties => {
    if (!canvasInstance || !imageObjectUrlRef.current) return {};
    const zoomedPinSize = 80;
    const { width, height } = canvasInstance.getBounds();
    if (width <= 0 || height <= 0) return {};
    const zoom = 6;           
    const zoomedBGWidth = width * zoom; 
    const zoomedBGHeight = height * zoom;
    const zoomedX = pin.coordinates.x * zoom;
    const zoomedY = pin.coordinates.y * zoom;
    //account for pin sizes
    //TODO harded 6px for accuracy, find source of offset later?
    const x = -(zoomedX - zoomedPinSize / 2) - 6;
    const y = -(zoomedY - zoomedPinSize / 2) - 6;
    const topBorderColor = lastColor ? rgbToString(pin.color) : 'white';
    const bottomBorderColor = pin.color ? rgbToString(lastColor) : 'white';
    return {
        width: zoomedPinSize,
        height: zoomedPinSize,
        backgroundImage: `url(${imageObjectUrlRef.current})`,
        backgroundSize: `${zoomedBGWidth}px ${zoomedBGHeight}px`,
        backgroundPosition: `${x}px ${y}px`,
        borderColor: `${topBorderColor} ${bottomBorderColor} ${bottomBorderColor} ${topBorderColor}`,
    };
};

export const ZoomPreview: React.FC<ZoomPreviewProps> = ({pin}) => {
    if (!pin) return <div></div>;
    const { canvasInstance, imageObjectUrlRef } = useCanvas();
    const [lastColor, setLastColor] = useState<RGB | undefined>(pin.color);

    return (
        // <div className="zoom-preview" style={getZoomStyle(pin.coordinates)}></div>
<div className="zoom-preview" style={getZoomStyle(pin, pin.color, canvasInstance, imageObjectUrlRef)}></div>
    );
}