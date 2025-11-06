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

test('getCanvasCoordinates conversion from react-draggable coords to canvas class coords', () => {
    const el = makeCanvasEl(200, 100);
    const c = new Canvas(el);
    const p = c.getCanvasCoordinates({ x: 120, y: 60 });
    expect(p).toBeDefined();
    if (!p) return;
    expect(p.x).toBeCloseTo(120);
    expect(p.y).toBeCloseTo(60);
});

test('getPixelColor returns undefined for out-of-bounds', () => {
    const el = makeCanvasEl(10, 10);
    const c = new Canvas(el);
    const color = c.getPixelColor({ x: 999, y: 999 });
    expect(color).toBeUndefined();
    const color2 = c.getPixelColor({ x: -5, y: -5 });
    expect(color2).toBeUndefined();
});

test('getDragDimensions returns bounding client rect', () => {
    const el = makeCanvasEl(200, 100);
    const c = new Canvas(el);
    const dimensions = c.getDragDimensions();
    expect(dimensions).toEqual({ width: 200, height: 100 });
});


test('getCanvasCoordinates returns undefined when canvas is not laid out', () => {
    const el = makeCanvasEl(200, 100);
    // simulate display:none or not in DOM
    el.getBoundingClientRect = () => ({ width: 0, height: 0 } as any);
    const c = new Canvas(el);
    const p = c.getCanvasCoordinates({ x: 10, y: 10 });
    expect(p).toBeUndefined();
});

test('event system on/off emits canvasDrawn', () => {
    const el = makeCanvasEl();
    const c = new Canvas(el);
    const cb = jest.fn();
    c.on('canvasDrawn', cb);
    
    if (typeof (c as any).emitCanvasDrawn === 'function') (c as any).emitCanvasDrawn();
    expect(cb).toHaveBeenCalled();
});

test('drawImage calls context.drawImage and emits canvasDrawn', () => {
    const el = makeCanvasEl(100, 50);
    const ctx = el.getContext('2d') as CanvasRenderingContext2D;
    const drawSpy = jest.spyOn(ctx, 'drawImage').mockImplementation(() => {});
    const c = new Canvas(el as any);
    const cb = jest.fn();
    c.on('canvasDrawn', cb);

    const img = {} as HTMLImageElement;
    c.drawImage(img);
    expect(drawSpy).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledTimes(1);

    // Call again to ensure it emits each draw
    c.drawImage(img);
    expect(cb).toHaveBeenCalledTimes(2);

    drawSpy.mockRestore();
});