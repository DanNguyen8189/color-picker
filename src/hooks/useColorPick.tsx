import { Canvas } from '../util'

export function useColorPick(
    //canvasRef: React.RefObject<HTMLCanvasElement | null>,
    //canvas: Canvas,
    canvasInstanceRef: React.RefObject<Canvas | null>,
    //e:any, 
    coordinates: {x:number, y:number},
    id:string,
) {
    if (canvasInstanceRef.current == null) return;
    //e.preventDefault();
    //const canvas = new Canvas(canvasRef.current!);
    
    //const coordinates = {x: data.x, y: data.y};

    //convert coordinates to "canvas" class coordinates
    const canvasCordinates = canvasInstanceRef.current.getCanvasCoordinates(coordinates) ?? {x:0, y:0};

    const color = canvasInstanceRef.current.getPixelColor(canvasCordinates);
    console.log("color from useColorPick: ", color);
    return color;
}