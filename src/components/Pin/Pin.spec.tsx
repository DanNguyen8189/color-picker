import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Pin } from './Pin'
import { Canvas } from '../../util/canvas';


function mockCanvas(): React.RefObject<Canvas> {
    const mock = {
        getBounds: jest.fn(() => ({ width: 300, height: 200 })),
        getPixelColorFromDraggableCoordinates: jest.fn(() => ({ r: 100, g: 150, b: 200 })),
        on: jest.fn(),
        off: jest.fn(),
    } as unknown as Canvas;
    return { current: mock };
}

// Mock Draggable component
const mockDraggable: React.FC<any> = ({ children, nodeRef, ...props }) => {
    return <div ref={nodeRef} data-testid="draggable-mock" {...props}>{children}</div>;
};

describe('Pin Component', () => {
    it('Pin with Draggable should be able to render correctly', async () => {

        const canvasInstanceRef = mockCanvas();

        const { getByTestId } = render(
            <Pin
                Draggable={mockDraggable as any}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin', positionX: 50, positionY: 50 }}
                onDrag={() => {}}
            />
        )

        // const pinContainer = getByTestId('pin-container')
        // expect(pinContainer).toBeInTheDocument()
        // expect(pinContainer.hidden).toBe(false)
        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinContainer = getByTestId('pin-with-draggable');
            expect(pinContainer).toBeInTheDocument();
        });
    })

    it('Pin without Draggable should be able to render correctly', async () => {

        const canvasInstanceRef = mockCanvas();

        const { getByTestId } = render(
            <Pin
                Draggable={null}
                canvasInstanceRef={canvasInstanceRef}
                pin={{ id: 'test-pin', positionX: 50, positionY: 50 }}
                onDrag={() => {}}
            />
        )

        await waitFor(() => {
            const pinContainer = getByTestId('pin-without-draggable');
            expect(pinContainer).toBeInTheDocument();
        });
    })

})
