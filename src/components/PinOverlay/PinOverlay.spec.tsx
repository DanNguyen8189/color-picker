import React, { act } from 'react'
import { render, waitFor } from '@testing-library/react'
import { PinOverlay } from './PinOverlay'
import { Canvas } from '../../util/canvas';

// mock canvas for testing - a full actual canvas would be overkill/slower, 
// brittle to canvas changes
function mockCanvas(): React.RefObject<Partial<Canvas>> {
    const mockCanvas = {
        current: {
            getBounds: jest.fn(() => ({ width: 300, height: 200 })),
            on: jest.fn(),
            off: jest.fn(),
        }
    } as React.RefObject<Partial<Canvas>>;
    return mockCanvas
}

// Mock the Pin component to avoid Pin's internal behavior, like useEffects/reading color
// Jest hoists the mock before any imports run, so PinOverlay will use this mock instead of the real Pin
//let pinOnDragHandlers: Map<string, Function> = new Map();
jest.mock('../Pin/Pin', () => ({
    //Pin: ({ pin, onDrag }: any) => {
    Pin: ({ pin }: any) => {
        // Store the onDrag handler
        // if (onDrag) {
        //     pinOnDragHandlers.set(pin.id, onDrag);
        // }
        return (
            <div data-testid="pin-with-draggable" id={pin.id}>
                Mocked Pin {pin.id}
            </div>
        );
    }
}));

describe('PinOverlay Component', () => {
    it('should render correctly', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;

        const { getByTestId } = render(
            <PinOverlay
                count={5}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        )

        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
        });
    })


    it('should render correct number of pins', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        const pinCount = 7; // Example pin count

        const { getByTestId, getAllByTestId } = render(
            <PinOverlay
                count={pinCount}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        )           
        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            // either pin variant actually works beacause they both are possible in render  
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        });
    })

    it('should update pins when count increases', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        let pinCount = 3;          
        const { getByTestId, getAllByTestId, rerender } = render(
            <PinOverlay
                count={pinCount}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        );  
        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        });
        // Update pin count
        pinCount = 6;
        rerender(
            <PinOverlay
                count={pinCount}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        );
        // Wait for the useEffect to re-initialize coordinates
        await waitFor(() => {
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        }
        );
    })

    it('should update pins when count decreases', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        let pinCount = 5;          
        const { getByTestId, getAllByTestId, rerender } = render(
            <PinOverlay
                count={pinCount}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        );  
        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        });
        // Update pin count
        pinCount = 2;
        rerender(
            <PinOverlay
                count={pinCount}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        );
        // Wait for the useEffect to re-initialize coordinates
        await waitFor(() => {
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        }
        );
    })

    it('should have a new set of pins when image changes', async () => {
        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        const setPinsParent = jest.fn();
        
        render(
            <PinOverlay
                count={4}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={setPinsParent}
            />
        );
        
        await waitFor(() => {
            expect(setPinsParent).toHaveBeenCalledTimes(2); // Initial render
            // once when mounted, then once after pins are generated
        });


        /**
         * Trigger the 'canvasDrawn' event to simulate an image change.
         * Find the registered 'canvasDrawn' event handler and call it to simulate the event.
         * Since we mocked the 'on' method, we can inspect its calls to find our handler.
         * It's call is recorded as an array where element 0 is the event name
         * and element 1 is the handler function. [ ['canvasDrawn', handler], ... ].
         */
        const callCanvasDrawn = (canvasInstanceRef.current!.on as jest.Mock).mock.calls
            .find(call => call[0] === 'canvasDrawn')?.[1];
        
        act(() => {
            // any code that causes state updates should be wrapped in act()
            // so that React processes all updates before we make assertions
            callCanvasDrawn();
        });

        await waitFor(() => {
            expect(setPinsParent).toHaveBeenCalledTimes(3);
        });
    })

//     it('should update pin color when handleDrag is called', async () => {
//   pinOnDragHandlers.clear();

//   const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
//   const setPinsParent = jest.fn();

//   const { getAllByTestId } = render(
//     <PinOverlay
//       count={2}
//       canvasInstanceRef={canvasInstanceRef}
//       setPinsParent={setPinsParent}
//     />
//   );

//   // Ensure pins are rendered
//   await waitFor(() => {
//     expect(getAllByTestId('pin-with-draggable').length).toBe(2);
//   });

//   // Ensure the effect that calls setPinsParent has run
//   await waitFor(() => {
//     expect(setPinsParent).toHaveBeenCalled();
//   });

//   // Use the most recent call (effect can run more than once)
//   const lastPins = setPinsParent.mock.calls.at(-1)![0] as any[];
//   expect(Array.isArray(lastPins)).toBe(true);
//   const pinId = lastPins[0].id;

//   setPinsParent.mockClear();

//   // Drive handleDrag via the stored onDrag handler
//   const handleDrag = pinOnDragHandlers.get(pinId);
//   expect(handleDrag).toBeDefined();

//   act(() => {
//     handleDrag?.({}, { r: 255, g: 128, b: 64 }, pinId);
//   });

//   await waitFor(() => {
//     expect(setPinsParent).toHaveBeenCalled();
//     const updatedPins = setPinsParent.mock.calls.at(-1)![0] as any[];
//     const updated = updatedPins.find(p => p.id === pinId);
//     expect(updated.r).toBe(255);
//     expect(updated.g).toBe(128);
//     expect(updated.b).toBe(64);
//   });
//     });

    it('should not generate pins if canvas is not ready', async () => {

        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;  
        canvasInstanceRef.current!.getBounds = jest.fn(() => ({ width: 0, height: 0 }));
        const { getByTestId, queryAllByTestId } = render(
            <PinOverlay

                count={5}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        )
        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            const pins = queryAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(0); // No pins should be generated
        });
    })

    it('should remove canvas event listener on unmount', async () => {
        const canvasInstanceRef = mockCanvas() as React.RefObject<Canvas>;
        const offSpy = canvasInstanceRef.current!.off as jest.Mock;
        
        const { unmount } = render(
            <PinOverlay
                count={3}
                canvasInstanceRef={canvasInstanceRef}
                setPinsParent={() => {}}
            />
        );
        
        await waitFor(() => {
            expect(canvasInstanceRef.current!.on).toHaveBeenCalledWith('canvasDrawn', expect.any(Function));
        });
        
        unmount();
        
        expect(offSpy).toHaveBeenCalledWith('canvasDrawn', expect.any(Function));
    });
})