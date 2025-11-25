import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Pin } from './Pin'
/**
 * Pin Component Tests
 * Checks for:
 * - rendering with and without Draggable (SSR compatibility)
 * - correct color picking from canvas quadrants    
 * - guards against uninitialized canvas reads
 * - Handling of undefined colors gracefully
 * - Prevention of infinite re-render loops on drag
 */

// mock Canvas class for testing - a full actual canvas would be overkill/slower, 
// brittle to canvas changes
// function mockCanvas(): React.RefObject<Partial<Canvas>> {
//     const colorPick = (c: any) => {
//         const { x, y } = c;
//         if (x < 150 && y < 100) return { r: 255, g: 0, b: 0 };
//         if (x >= 150 && y < 100) return { r: 0, g: 255, b: 0 };
//         if (x < 150 && y >= 100) return { r: 0, g: 0, b: 255 };
//         return { r: 255, g: 255, b: 0 };
//     };
//     const mockCanvas = {
//         current: {
//             getBounds: jest.fn(() => ({ width: 300, height: 200 })),
//             // "c" is the coordinates object supplied by Pin component
//             getPixelColor: jest.fn((c: any) => colorPick(c)),
//             getPixelColorRaw: jest.fn((c: any) => colorPick(c)),
//             on: jest.fn(),
//             off: jest.fn(),
//         }
//     } as React.RefObject<Partial<Canvas>>;
//     return mockCanvas
// }

const colorPick = (c: any) => {
    const { x, y } = c;
    if (x < 150 && y < 100) return { r: 255, g: 0, b: 0 };
    if (x >= 150 && y < 100) return { r: 0, g: 255, b: 0 };
    if (x < 150 && y >= 100) return { r: 0, g: 0, b: 255 };
    return { r: 255, g: 255, b: 0 };
};

const mockCanvasInstance: any = {
    getBounds: jest.fn(() => ({ width: 300, height: 200 })),
    on: jest.fn(),
    off: jest.fn(),
    getPixelColor: jest.fn((c: any) => colorPick(c)),
};
// Mock the hook PinOverlay uses to access the context. Note: import must match exactly or
// else it tries to use the real hook!
jest.mock('../../util/CanvasContext', () => ({
    __esModule: true,
    useCanvas: () => ({
        canvasInstance: mockCanvasInstance,
        imageElement: null,
        imageUrl: null,
        setImageUrl: jest.fn(),
        setImageElement: jest.fn(),
        writeImage: jest.fn(),
    }),
    rgbToString: (rgb: {r:number, g:number, b:number}) => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
}));
beforeEach(() => {
    jest.clearAllMocks();
    (mockCanvasInstance.getBounds as jest.Mock).mockReset().mockReturnValue({ width: 300, height: 200 });
});

// Mock Draggable component
const MockDraggable: React.FC<any> = ({ 
    children, 
    nodeRef, 
    defaultPosition,
    bounds,
    onDrag,
    onStart,
    onStop,
    ...props }) => {
    return <div ref={nodeRef} data-testid="draggable-mock" {...props}>{children}</div>;
};

// Factory that simulates a drag to specific coordinates
const makeDraggableThatDragsTo = (x: number, y: number): React.FC<any> =>
    (props) => {
        React.useLayoutEffect(() => {
            props.onDrag?.({}, { x, y });
        }, [props.onDrag]);
        return <MockDraggable {...props} />;
    };

describe('Pin Component', () => {
    it('with Draggable should be able to render correctly', async () => {


        const { getByTestId } = render(
            <Pin
                Draggable={MockDraggable as any}
                pin={{ id: 'test-pin', coordinates: {x:50, y:50}}}
                onStart={() => {}}
                onDrag={() => {}}
                onStop={() => {}}
                isDimmed={false}
            />
        )

        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pin = getByTestId('pin-with-draggable');
            expect(pin).toBeInTheDocument();
        });
    })

    it('without Draggable should be able to render correctly', async () => {

        const { getByTestId } = render(
            <Pin
                Draggable={null}
                pin={{ id: 'test-pin', coordinates: {x:50, y:50}}}
                onStart={() => {}}
                onDrag={() => {}}
                onStop={() => {}}
                isDimmed={false}
            />
        )

        await waitFor(() => {
            const pin = getByTestId('pin-without-draggable');
            expect(pin).toBeInTheDocument();
        });
    })
    // Pin not responsible to gettings colors anymore
    // it('should read correct color based on where it is on canvas', async () => {
    // // Wrapper that holds pin state and updates it when onDrag fires
    // const TestWrapper = () => {
    //     const [pin, setPin] = React.useState({ 
    //         id: 'test-pin', 
    //         coordinates: { x: 250, y: 50 } 
    //     });

    //     const handleDrag = (_e: any, updatedPin: any) => {
    //         setPin(updatedPin); // Update pin with color
    //     };

    //     return (
    //         <Pin
    //             Draggable={MockDraggable as any}
    //             pin={pin}
    //             onStart={() => {}}
    //             onDrag={handleDrag}
    //             onStop={() => {}}
    //             isDimmed={false}
    //         />
    //     );
    // };

    // const { getByTestId } = render(<TestWrapper />);

    // await waitFor(() => {
    //     const pin = getByTestId('pin-with-draggable');
    //     expect(pin.style.backgroundColor).toBe('rgb(0, 255, 0)');
    // });
    // })
    // Don't need anymore; coordinates are always set only if canvas is ready in PinOverlay
    // it("should not attempt to read color when coordinates are not set/canvas not laid out", async () => {
    //     // Mock canvas with zero bounds (not laid out)

    //     (mockCanvasInstance.getBounds as jest.Mock).mockReturnValue({ width: 0, height: 0 });


    //     const { container } = render(
    //         <Pin
    //             Draggable={MockDraggable as any}
    //             pin={{ id: 'test-pin', coordinates: {x:50, y:50}}}
    //             onStart={() => {}}
    //             onDrag={() => {}}
    //             onStop={() => {}}
    //             isDimmed={false}
    //         />
    //     );

    //     // Should return null (no coordinates set)
    //     expect(container.firstChild).toBeNull();
        
    //     // Should never try to read pixels
    //     expect(mockCanvasInstance.getPixelColor).not.toHaveBeenCalled();
    // })

    it('does not enter infinite loop on rapid drags', async () => {

        const onDragMock = jest.fn();
        const DragToSameSpot = makeDraggableThatDragsTo(100, 50); // top-left quadrant          
        const { getByTestId } = render(
            <Pin
                Draggable={DragToSameSpot as any}
                pin={{ id: 'test-pin', coordinates: {x:50, y:50}}}
                onStart={() => {}}
                onDrag={onDragMock}
                onStop={() => {}}
                isDimmed={false}
            />
        )
        await waitFor(() => {
            const pin = getByTestId('pin-with-draggable');
            // expect(mockCanvasInstance.getPixelColor).toHaveBeenCalled();
            //expect(onDragMock).toHaveBeenCalledTimes(2); // pin initial read + drag (old ffunctionality)
            expect(onDragMock).toHaveBeenCalledTimes(1);
            //expect(getComputedStyle(pin).backgroundColor).toBe('rgb(255, 0, 0)');
            //expect(pin.style.getPropertyValue('--pin-color')).toBe('rgb(255, 0, 0)');
        });
    });

    // it('does not crash when canvas returns undefined color', async () => {

    //     (mockCanvasInstance.getPixelColor as jest.Mock).mockReturnValue(undefined);      

    //     const onDragMock = jest.fn();
    //     const DragToUndefinedColor = makeDraggableThatDragsTo(100, 50); // top-left quadrant

    //     const { getByTestId } = render(
    //         <Pin
    //             Draggable={DragToUndefinedColor as any}
    //             pin={{ id: 'test-pin', coordinates: {x:50, y:50}}}
    //             onStart={() => {}}
    //             onDrag={onDragMock}
    //             onStop={() => {}}
    //             isDimmed={false}
    //         />
    //     )

    //     await waitFor(() => {
    //         const pin = getByTestId('pin-with-draggable');
    //         //expect(mockCanvasInstance.getPixelColor).toHaveBeenCalled();
    //         //expect(onDragMock).toHaveBeenCalledTimes(0); // since getpixelcolor returns undefined
    //         // pin never gets a valid color. OnDrag only called when color is read.
    //         expect(pin.style.getPropertyValue('--pin-color')).toBe('transparent');
    //     });
    // });
});