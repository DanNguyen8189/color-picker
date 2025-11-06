import { useEffect, useRef, useState } from 'react'
import { Canvas } from '../util'

export function writeImage(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imgSrc: string
) {
    const canvasInstanceRef = useRef<Canvas | null>(null)
    useEffect(() => {

        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        if (canvasInstanceRef.current === null) {
            canvasInstanceRef.current = new Canvas(canvasElement);
        }
        const canvas = canvasInstanceRef.current;

        if (!imgSrc) return;
        canvas.reset();

        let cancelled = false;
        const img = new Image();
        // For external URLs; harmless for blob URLs
        img.crossOrigin = 'anonymous';

        // callback that runs asynchronously when image is loaded
        img.onload = () => {
            if (cancelled) return;
            // size to image; or el.clientWidth/Height if you want to fit container
            canvas.setDimensions(img.naturalWidth, img.naturalHeight);
            canvas.drawImage(img);
        };

        img.onerror = (e) => {
            console.error('Error loading image', e);
        };

        img.src = imgSrc; // triggers img.onload

        return () => {
            // this cleanup function runs when imgSrc changes or component unmounts
            // it blocks the img.onload from drawing to a stale/unmounted canvas
            // 1. useEffect runs for image A → cancelled = false
            // 2. User picks image B before A is done → imgSrc changes
            // 3. React runs cleanup: return () => { cancelled = true; }
            // 4. New useEffect runs for image B since cancelled == false
            // 5. Image A finishes loading → onload fires, but:
            //    since cancelled was set to true, it doesn't draw the canvas for it
            // 6. Image B however loads and draws correctly
            cancelled = true;
        };

    }, [imgSrc])

    return canvasInstanceRef
}