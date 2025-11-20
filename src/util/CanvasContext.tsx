// @refresh reset
import React, { useState, createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '../util';

type CanvasContextType = {
    canvasInstance: Canvas | null;
    imageElement: HTMLImageElement | null;
    imageObjectUrlRef: React.RefObject<string | null>;
    setImageElement: (img: HTMLImageElement | null) => void;
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
    const canvasInstanceRef = useRef<Canvas | null>(null);
    const imageObjectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const canvasElement = canvasRef.current;
        if (canvasElement && !canvasInstanceRef.current) {
            canvasInstanceRef.current = new Canvas(canvasElement);
        }
    }, [canvasRef]);

    useEffect(()=>{
        return () => {
            // revoke the last object url on unmount
            if (imageObjectUrlRef.current) {
                URL.revokeObjectURL(imageObjectUrlRef.current);
                imageObjectUrlRef.current = null;
            }
        }
    }, []);

    const loadImage = (url: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });

    // useCallBack is used here so it maintains a stable ref across rerenders
    // otherwise a new fn is created on every render/state change of CanvasProvider
    // fn is created once and reused until canvasRef changes
    // fns exposed outside through contect should always be memoized like this
    const writeImage = useCallback(async (src: File | string | HTMLImageElement) => {
        // File: comes from <input type="file">
        // string: already have a URL (blob/object URL, data URL, or remote URL)
        // HTMLImageElement: already loaded image element
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

        if (src instanceof HTMLImageElement) {
            img = src;
        } else if (typeof src === 'string') {
            img = await loadImage(src);
        } else {
            if (imageObjectUrlRef.current){
                URL.revokeObjectURL(imageObjectUrlRef.current);
                imageObjectUrlRef.current = null;
            }
            imageObjectUrlRef.current = URL.createObjectURL(src);

            img = await loadImage(imageObjectUrlRef.current);
        }

        setImageElement(img); 

        canvas.reset();
        canvas.setDimensions(img.naturalWidth, img.naturalHeight);
        canvas.drawImage(img);

        console.log('✅ Image drawn:', img.naturalWidth, 'x', img.naturalHeight);

    }, [canvasRef]);

    return (
        <CanvasContext.Provider value={{ 
            canvasInstance: canvasInstanceRef.current,
            imageElement,
            imageObjectUrlRef,
            setImageElement,
            writeImage
        }}>
            {children}
        </CanvasContext.Provider>
    );
};