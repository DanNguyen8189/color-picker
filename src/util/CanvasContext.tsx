// @refresh reset
import React, { useState, createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '../util';

type CanvasContextType = {
    canvasInstance: Canvas | null;
    imageElement: HTMLImageElement | null;
    setImageElement: (img: HTMLImageElement | null) => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    writeImage: (src: File | string | HTMLImageElement) => Promise<void>;
};

const CanvasContext = createContext<CanvasContextType | null>(null);

export function useCanvas() {
    const ctx = useContext(CanvasContext);
    if (!ctx) throw new Error('useCanvas must be used within CanvasProvider');
    return ctx;
}

export const CanvasProvider: React.FC<{ 
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    children: React.ReactNode 
}> = ({ canvasRef, children }) => {
    const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const canvasInstanceRef = useRef<Canvas | null>(null);

    useEffect(() => {
        const canvasElement = canvasRef.current;
        if (canvasElement && !canvasInstanceRef.current) {
            canvasInstanceRef.current = new Canvas(canvasElement);
        }
    }, [canvasRef]);

    const loadImage = (url: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });

    const writeImage = useCallback(async (src: File | string | HTMLImageElement) => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) {
            console.warn('⚠️ Canvas element not ready');
            return};

        if (canvasInstanceRef.current === null) {
            canvasInstanceRef.current = new Canvas(canvasElement);
        }
        const canvas = canvasInstanceRef.current;
        console.log('✅ Canvas instance ready');

        let img: HTMLImageElement;
        let revokeUrl: string | undefined;

        if (src instanceof HTMLImageElement) {
            img = src;
        } else if (typeof src === 'string') {
            img = await loadImage(src);
        } else {
            const objectUrl = URL.createObjectURL(src);
            revokeUrl = objectUrl;
            img = await loadImage(objectUrl);
        }

        setImageElement(img);

        canvas.reset();
        canvas.setDimensions(img.naturalWidth, img.naturalHeight);
        canvas.drawImage(img);

        console.log('✅ Image drawn:', img.naturalWidth, 'x', img.naturalHeight);

        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    }, [canvasRef]);

    return (
        <CanvasContext.Provider value={{ 
            canvasInstance: canvasInstanceRef.current,
            imageElement,
            setImageElement,
            zoomLevel,
            setZoomLevel,
            writeImage
        }}>
            {children}
        </CanvasContext.Provider>
    );
};