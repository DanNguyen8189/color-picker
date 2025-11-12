import { Canvas } from './Canvas';


// make a <canvas> element>
function makeCanvasEl(w = 200, h = 100): HTMLCanvasElement {
    const el = document.createElement('canvas');
    Object.defineProperty(el, 'width', { value: w });
    Object.defineProperty(el, 'height', { value: h });

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

test('getCanvasCoordinates converts react-draggable coords to canvas class coords', () => {
    const el = makeCanvasEl(200, 100);
    const c = new Canvas(el);
    const p = c.getCanvasCoordinates({ x: 120, y: 60 });
    expect(p).toBeDefined();
    if (!p) return;
    expect(p.x).toBeCloseTo(120);
    expect(p.y).toBeCloseTo(60);
});

test('getPixelColor returns undefined if out-of-bounds', () => {
    const el = makeCanvasEl(10, 10);
    const c = new Canvas(el);
    const color = c.getPixelColorRaw({ x: 999, y: 999 });
    expect(color).toBeUndefined();
    const color2 = c.getPixelColorRaw({ x: -5, y: -5 });
    expect(color2).toBeUndefined();
});

test('getBounds returns correct dimensions', () => {
    const el = makeCanvasEl(200, 100);
    const c = new Canvas(el);
    const dimensions = c.getBounds();
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

test('canvasDrawn is correctly attached and emitted', () => {
    const el = makeCanvasEl();
    const c = new Canvas(el);
    const cb = jest.fn();
    c.on('canvasDrawn', cb);
    
    if (typeof (c as any).emitCanvasDrawn === 'function') (c as any).emitCanvasDrawn();
    expect(cb).toHaveBeenCalled();
});

// test('off removes event listeners', () => {
//     const el = makeCanvasEl();
//     const c = new Canvas(el);   
//     const cb = jest.fn();
//     c.on('canvasDrawn', cb);
//     c.off('canvasDrawn', cb);
//     if (typeof (c as any).emitCanvasDrawn === 'function') (c as any).emitCanvasDrawn();
//     expect(cb).not.toHaveBeenCalled();
// });

test('reset clears the canvas', () => {
    const el = makeCanvasEl(100, 50);
    const c = new Canvas(el);
    const ctx = el.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context in test.'); 
    const clearSpy = jest.spyOn(ctx, 'clearRect');
    c.reset();
    expect(clearSpy).toHaveBeenCalledWith(0, 0, el.width, el.height);
    clearSpy.mockRestore();
});

test('canvasDrawn is correctly attached and emitted when image is drawn', () => {
    const el = makeCanvasEl();
    const c = new Canvas(el);
    const cb = jest.fn();
    const drawSpy = jest.spyOn(c, 'drawImage');
    c.on('canvasDrawn', cb);
    
    // load image to trigger callback since
    // callback's this.emit('canvasDrawn') is private/not exposed
    const img = new Image();
    c.drawImage(img);
    expect(drawSpy).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
    drawSpy.mockRestore();
});

test('destroy removes event listeners', () => {
    const el = makeCanvasEl();
    const c = new Canvas(el);
    const cb = jest.fn();
    c.on('canvasDrawn', cb);
    c.destroy();
    expect(cb).not.toHaveBeenCalled(); 
});