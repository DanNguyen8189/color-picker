import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Pin } from './Pin'
import { Canvas } from '../../util/canvas';

// mock canvas for testing - a full actual canvas would be overkill/slower, 
// brittle to canvas changes
function mockCanvas(): React.RefObject<Partial<Canvas>> {
    const colorPick = (c: any) => {
        const { x, y } = c;
        if (x < 150 && y < 100) return { r: 255, g: 0, b: 0 };
        if (x >= 150 && y < 100) return { r: 0, g: 255, b: 0 };
        if (x < 150 && y >= 100) return { r: 0, g: 0, b: 255 };
        return { r: 255, g: 255, b: 0 };
    };
    const mockCanvas = {
        current: {
            getBounds: jest.fn(() => ({ width: 300, height: 200 })),
            // "c" is the coordinates object supplied by Pin component
            getPixelColor: jest.fn((c: any) => colorPick(c)),
            getPixelColorRaw: jest.fn((c: any) => colorPick(c)),
            on: jest.fn(),
            off: jest.fn(),
        }
    } as React.RefObject<Partial<Canvas>>;
    return mockCanvas
}

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

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;

        const { getByTestId } = render(
            <Pin
                Draggable={MockDraggable as any}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin'}}
                onDrag={() => {}}
            />
        )

        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pin = getByTestId('pin-with-draggable');
            expect(pin).toBeInTheDocument();
        });
    })

    it('without Draggable should be able to render correctly', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;

        const { getByTestId } = render(
            <Pin
                Draggable={null}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin'}}
                onDrag={() => {}}
            />
        )

        await waitFor(() => {
            const pin = getByTestId('pin-without-draggable');
            expect(pin).toBeInTheDocument();
        });
    })

    it('should read correct color based on where it is on canvas', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        const onDragMock = jest.fn();
        const DragToTR = makeDraggableThatDragsTo(250, 50); // top-right quadrant
        
        const { getByTestId } = render(
            <Pin
                Draggable={DragToTR as any}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin'}}
                onDrag={onDragMock}
            />
        )

        await waitFor(() => {
            const pin = getByTestId('pin-with-draggable');
            // expect(pinContainer).toBeInTheDocument();      
            expect(canvasInstanceRef.current?.getPixelColor).toHaveBeenCalled();
            expect(onDragMock).toHaveBeenCalled(); 
            expect(getComputedStyle(pin).backgroundColor).toBe('rgb(0, 255, 0)');
        });
    })

    it("should not attempt to read color when coordinates are not set/canvas not laid out", async () => {
        // Mock canvas with zero bounds (not laid out)
        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        (canvasInstanceRef.current!.getBounds as jest.Mock).mockReturnValue({ width: 0, height: 0 });


        const { container } = render(
            <Pin
                Draggable={MockDraggable as any}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin' }}
                onDrag={() => {}}
            />
        );

        // Should return null (no coordinates set)
        expect(container.firstChild).toBeNull();
        
        // Should never try to read pixels
        expect(canvasInstanceRef.current?.getPixelColor).not.toHaveBeenCalled();
    })

    it('does not enter infinite loop on rapid drags', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        const onDragMock = jest.fn();
        const DragToSameSpot = makeDraggableThatDragsTo(100, 50); // top-left quadrant          
        const { getByTestId } = render(
            <Pin
                Draggable={DragToSameSpot as any}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin'}}
                onDrag={onDragMock}
            />
        )
        await waitFor(() => {
            const pin = getByTestId('pin-with-draggable');
            expect(canvasInstanceRef.current?.getPixelColor).toHaveBeenCalled();
            expect(onDragMock).toHaveBeenCalledTimes(2); // pin initial read + drag
            expect(getComputedStyle(pin).backgroundColor).toBe('rgb(255, 0, 0)');
        });
    });

    it('does not crash when canvas returns undefined color', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        (canvasInstanceRef.current!.getPixelColor as jest.Mock).mockReturnValue(undefined);      

        const onDragMock = jest.fn();
        const DragToUndefinedColor = makeDraggableThatDragsTo(100, 50); // top-left quadrant

        const { getByTestId } = render(
            <Pin
                Draggable={DragToUndefinedColor as any}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin'}}
                onDrag={onDragMock}
            />
        )

        await waitFor(() => {
            const pin = getByTestId('pin-with-draggable');
            expect(canvasInstanceRef.current?.getPixelColor).toHaveBeenCalled();
            expect(onDragMock).toHaveBeenCalledTimes(0);
            expect(getComputedStyle(pin).backgroundColor).toBe('transparent');
        });
    });
});