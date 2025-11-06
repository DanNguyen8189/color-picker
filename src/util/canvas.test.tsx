import { Canvas } from './canvas';


function makeCanvasEl(w = 200, h = 100): HTMLCanvasElement {
    const el = document.createElement('canvas');
    Object.defineProperty(el, 'width', { value: w });
    Object.defineProperty(el, 'height', { value: h });

    // layout rect for getBoundingClientRect
    el.getBoundingClientRect = () => ({ 
        width: w, 
        height: h, 
        top: 10, 
        left: 20, 
        bottom: 0,
        right: 0, 
        x: 20, 
        y: 0, 
        toJSON: () => {} 
    } as any);
    return el;
}

// testing with actual color doesn't work in jest-canvas-mock environment,
// and is overkill. Save for integration/e2e tests

// function fillCanvasWithColor(canvas: HTMLCanvasElement, color: string) {
//     const ctx = canvas.getContext('2d');
//     if (!ctx) throw new Error('No 2d context');
//     ctx.fillStyle = color;
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
// }

// function drawColoredSquares(canvas: HTMLCanvasElement) {
//     const ctx = canvas.getContext('2d');
//     if (!ctx) throw new Error('No 2d context');
    
//     // Red top-left quadrant
//     ctx.fillStyle = 'rgb(255, 0, 0)';
//     ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
    
//     // Green top-right
//     ctx.fillStyle = 'rgb(0, 255, 0)';
//     ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height / 2);
    
//     // Blue bottom-left
//     ctx.fillStyle = 'rgb(0, 0, 255)';
//     ctx.fillRect(0, canvas.height / 2, canvas.width / 2, canvas.height / 2);
    
//     // Yellow bottom-right
//     ctx.fillStyle = 'rgb(255, 255, 0)';
//     ctx.fillRect(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
// }

test('getCanvasCoordinates conversion from react-draggable coords to canvas class coords', () => {
    const el = makeCanvasEl(200, 100);
    const c = new Canvas(el as any);
    const p = c.getCanvasCoordinates({ x: 120, y: 60 }); // DOM px
    expect(p).toBeDefined();
    if (!p) return;
    expect(p.x).toBeCloseTo(120);
    expect(p.y).toBeCloseTo(60);
});

test('getPixelColor returns undefined for out-of-bounds', () => {
    const el = makeCanvasEl(10, 10);
    const c = new Canvas(el as any);
    const color = c.getPixelColor({ x: 999, y: 999 });
    expect(color).toBeUndefined();
    const color2 = c.getPixelColor({ x: -5, y: -5 });
    expect(color2).toBeUndefined();
});

// test('getPixelColor reads correct RGB value from solid color canvas', () => {
//     const el = makeCanvasEl(100, 100);
//     fillCanvasWithColor(el, 'rgb(42, 128, 200)');
    
//     const c = new Canvas(el);
//     const color = c.getPixelColor({ x: 50, y: 50 });
    
//     expect(color).toBeDefined();
//     expect(color).toEqual({ r: 42, g: 128, b: 200 });
// });

// test('getPixelColor reads different colors from quadrants', () => {
//     const el = makeCanvasEl(100, 100);
//     drawColoredSquares(el);
    
//     const c = new Canvas(el as any);
    
//     // Top-left: red
//     const red = c.getPixelColor({ x: 25, y: 25 });
//     expect(red).toEqual({ r: 255, g: 0, b: 0 });
    
//     // Top-right: green
//     const green = c.getPixelColor({ x: 75, y: 25 });
//     expect(green).toEqual({ r: 0, g: 255, b: 0 });
    
//     // Bottom-left: blue
//     const blue = c.getPixelColor({ x: 25, y: 75 });
//     expect(blue).toEqual({ r: 0, g: 0, b: 255 });
    
//     // Bottom-right: yellow
//     const yellow = c.getPixelColor({ x: 75, y: 75 });
//     expect(yellow).toEqual({ r: 255, g: 255, b: 0 });
// });


// test('getPixelColorFromDraggableCoordinates works with scaling', () => {
//     const el = makeCanvasEl(200, 100); // canvas internal size
//     // Simulate it being displayed at half size in the DOM
//     el.getBoundingClientRect = () => ({ 
//         width: 100,  // DOM/CSS size
//         height: 50, 
//         top: 0, 
//         left: 0, 
//         bottom: 50, 
//         right: 100, 
//         x: 0, 
//         y: 0, 
//         toJSON: () => {} 
//     } as any);
    
//     fillCanvasWithColor(el, 'rgb(10, 20, 30)');
    
//     const c = new Canvas(el as any);
//     // Draggable coordinate at DOM position (50, 25)
//     // Should map to canvas pixel (100, 50) due to 2x scaling
//     const color = c.getPixelColorFromDraggableCoordinates({ x: 50, y: 25 });
    
//     expect(color).toBeDefined();
//     expect(color).toEqual({ r: 10, g: 20, b: 30 });
// });

// test('raw canvas drawing works in test environment', () => {
//     const el = makeCanvasEl(10, 10);
//     const ctx = el.getContext('2d')!;
    
//     ctx.fillStyle = 'rgb(100, 150, 200)';
//     ctx.fillRect(0, 0, 10, 10);
    
//     const data = ctx.getImageData(5, 5, 1, 1).data;
//     console.log('Pixel data:', Array.from(data)); // Debug output
    
//     expect(data[0]).toBe(100); // r
//     expect(data[1]).toBe(150); // g
//     expect(data[2]).toBe(200); // b
// });

test('event system on/off emits canvasDrawn', () => {
    const el = makeCanvasEl();
    const c = new Canvas(el as any);
    const cb = jest.fn();
    c.on('canvasDrawn', cb);
    
    if (typeof (c as any).emitCanvasDrawn === 'function') (c as any).emitCanvasDrawn();
    expect(cb).toHaveBeenCalled();
});