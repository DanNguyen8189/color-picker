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

    public listenMovements(listener: any) {
        this.canvas.addEventListener('touchmove', listener)
        this.canvas.addEventListener('pointermove', listener)
    }

    public cleanUp(listener: any) {
        this.canvas.removeEventListener('touchmove', listener)
        this.canvas.addEventListener('pointermove', listener)
    }

    public drawImage(img: any) {
        this.context.drawImage(img, 0, 0)
        this.emitCanvasDrawn();
    }

    public getImageSrc() {
        return this.canvas.toDataURL();
    }

    public setDimensions(width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
    }

    public getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        }
    }

    // for returning canvas bounds, translated for react-draggable library
    public getDragDimensions(){
        const rect = this.canvas.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
        }
    }

    public getCanvasCenterPoint() {
        return {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
        }
    }

    // public getCanvasCoordinates(coordinates: Coordinates) {
    //     const rect = this.canvas.getBoundingClientRect()
    //     const scaleX = this.canvas.width / rect.width
    //     const scaleY = this.canvas.height / rect.height
    //     const x = (coordinates.x - rect.left) * scaleX
    //     const y = (coordinates.y - rect.top) * scaleY

    //     return { x, y }
    // }

    // translates coordinates from react-draggable to be useable by color picker
    public getCanvasCoordinates = (coordinates: Coordinates) => {
        // const canvas = canvasRef.current;
        // if (canvas === null) return;
        // const ctx = canvas.getContext("2d");
        // if (ctx === null) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width
        const scaleY = this.canvas.height / rect.height
        const x = (coordinates.x - rect.left) * scaleX
        const y = (coordinates.y) * scaleY
        return { x, y }
    }

    public getPixelColor(coordinates: Coordinates) {
        const pixelData = this.context.getImageData(
        coordinates.x,
        coordinates.y,
        1,
        1
        ).data
        if (pixelData.length < 4) return {r: 0, g: 0, b: 0}; // Return black color if unable to retrieve pixel data

        const [red, green, blue] = pixelData
        //return `rgb(${red}, ${green}, ${blue})`
        return {r: red, g: green, b: blue};
    }
    // const getPixelColor = (x: number, y: number) =>{
    //     const ctx = canvasRef.current?.getContext("2d");
    //     if (!ctx || !canvasRef.current) return 'rgb(0,0,0)';
    //         const pixelData = ctx.getImageData(
    //             x,
    //             y,
    //         1,
    //         1
    //         ).data
    //         if (pixelData.length < 4) return 'rgb(0,0,0)' // Return black color if unable to retrieve pixel data
    
    //         const [red, green, blue] = pixelData
    //         return `rgb(${red}, ${green}, ${blue})`
    //     }

    public getPixelColorFromDraggableCoordinates = (coordinates: {x:number, y:number}) => {
        if (this.canvas == null) return;
        //e.preventDefault();
        //const canvas = new Canvas(canvasRef.current!);
        
        //const coordinates = {x: data.x, y: data.y};

        //convert coordinates to "canvas" class coordinates
        const canvasCordinates = this.getCanvasCoordinates(coordinates) ?? {x:0, y:0};

        const color = this.getPixelColor(canvasCordinates);
        // console.log("color from useColorPick: ", color);
        return color;
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