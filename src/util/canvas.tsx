import type { RGB } from "../components/Types"

export type Coordinates = {
    x: number
    y: number
}

export class Canvas {
    private readonly canvas!: HTMLCanvasElement
    private readonly context!: CanvasRenderingContext2D
    private eventListeners: { [key: string]: Function[] } = {};

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = canvasElement
        this.context = this.canvas.getContext('2d', {
        willReadFrequently: true
        }) as CanvasRenderingContext2D
    }

    public listenMovements(listener: any): void {
        this.canvas.addEventListener('touchmove', listener)
        this.canvas.addEventListener('pointermove', listener)
    }

    public cleanUp(listener: any): void {
        this.canvas.removeEventListener('touchmove', listener)
        this.canvas.addEventListener('pointermove', listener)
    }

    public drawImage(img: any): void {
        this.context.drawImage(img, 0, 0)
        this.emitCanvasDrawn();
    }

    public getImageSrc(): string {
        return this.canvas.toDataURL();
    }

    public setDimensions(width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
    }

    public getDimensions(): { width: number; height: number } {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        }
    }

    // for returning canvas bounds, translated for react-draggable library
    public getDragDimensions(): { width: number; height: number } {
        const rect = this.canvas.getBoundingClientRect();

        // these return 0 if canvas is not yet drawn
        return {
            width: rect.width,
            height: rect.height,
        }
    }

    public getCanvasCenterPoint(): Coordinates {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        }
    }

    // translates coordinates from react-draggable to be useable by color picker
    public getCanvasCoordinates = (coordinates: Coordinates): Coordinates | undefined => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return undefined;
        const scaleX = this.canvas.width / rect.width
        const scaleY = this.canvas.height / rect.height
        const x = (coordinates.x - rect.left) * scaleX
        const y = (coordinates.y) * scaleY
        
        if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
        return { x, y }
    }

    public getPixelColor(coordinates: Coordinates):RGB | undefined {
        const x = Math.floor(coordinates.x);
        const y = Math.floor(coordinates.y);
        if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) return undefined;
        const pixelData = this.context.getImageData(x, y, 1, 1).data
        if (pixelData.length < 4) return undefined; 

        const [r, g, b, a] = pixelData
        if (a === 0) return undefined; // transparent pixel -> no color
        return { r, g, b };
    }


    public getPixelColorFromDraggableCoordinates = (
        coordinates: { x: number; y: number }
    ): { r: number; g: number; b: number } | undefined => {
        const canvasCoords = this.getCanvasCoordinates(coordinates);

        if (!canvasCoords) return undefined;
        return this.getPixelColor(canvasCoords);
    }

    on(event: string, callback: Function) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event: string, callback: Function) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }

    // emitted when image is loaded
    protected emitCanvasDrawn() {
        if (!this.eventListeners['canvasDrawn']) return;
        this.eventListeners['canvasDrawn'].forEach(callback => callback());
    }
}