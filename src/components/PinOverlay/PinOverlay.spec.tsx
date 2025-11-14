import React, { act } from 'react'
import { render, waitFor } from '@testing-library/react'
import { PinOverlay } from './PinOverlay'
import { Canvas } from '../../util/Canvas';

type RGBTestType = { r: number; g: number; b: number } | undefined; // RGB dupe for tests
type ImagePinTestType = { id: string; color?: RGBTestType }; // ImagePin dupe for tests
type PinDragTestType = (e: any, color: RGBTestType, id: string) => void; // Pin on drag handler test type

const mockCanvasInstance: any = {
    getBounds: jest.fn(() => ({ width: 300, height: 200 })),
    on: jest.fn(),
    off: jest.fn(),
    getPixelColor: jest.fn(),
};
// Mock the hook PinOverlay uses to access the context.
jest.mock('../../util/', () => ({
    useCanvas: () => ({
        canvasInstance: mockCanvasInstance,
        imageElement: null,
        imageUrl: null,
        setImageUrl: jest.fn(),
        setImageElement: jest.fn(),
        writeImage: jest.fn(),
    }),
}));
beforeEach(() => {
    jest.clearAllMocks();
    (mockCanvasInstance.getBounds as jest.Mock).mockReset().mockReturnValue({ width: 300, height: 200 });
});

// Mock the Pin component to avoid using a full implementation
// Jest hoists the mock before any imports run, so PinOverlay will use this mock instead of the real Pin
let pinOnDragHandlers: Map<string, PinDragTestType> = new Map(); // on drag handlers; one for each pin
jest.mock('../Pin/Pin', () => ({
    Pin: ({ pin, onDrag }: any) => {
    //Pin: ({ pin }: any) => {
        // Store onDrag handler
        if (onDrag) {
            pinOnDragHandlers.set(pin.id, onDrag);
        }
        return (
            <div data-testid="pin-with-draggable" id={pin.id}>
                Mocked Pin {pin.id}
            </div>
        );
    }
}));

describe('PinOverlay Component', () => {
    it('should render correctly', async () => {

        const { getByTestId } = render(
            <PinOverlay
                count={5}
                setPinsParent={() => {}}
            />
        )

        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
        });
    });


    it('should render correct number of pins', async () => {

        const pinCount = 7; // Example pin count

        const { getByTestId, getAllByTestId } = render(
            <PinOverlay
                count={pinCount}
                setPinsParent={() => {}}
            />
        )           
        // Wait for the useEffect to initialize coordinates
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            // either pin variant actually works beacause they both are possible in render  
            expect(getAllByTestId('pin-with-draggable').length).toBe(7);
        });
    });

    it('should handle zero pins correctly', async () => {
        const setPinsParent = jest.fn();
        
        const { getByTestId, queryAllByTestId } = render(
            <PinOverlay
                count={0}
                setPinsParent={setPinsParent}
            />
        );
        
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            expect(queryAllByTestId('pin-with-draggable').length).toBe(0);
        });
        
        // Verify setPinsParent was called with empty array
        expect(setPinsParent).toHaveBeenCalledWith([]);
    });

    it('should update pins when count increases', async () => {

        let pinCount = 3;          

        const { getByTestId, getAllByTestId, rerender } = render(
            <PinOverlay
                count={pinCount}
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

        pinCount = 6;
        rerender(
            <PinOverlay
                count={pinCount}
                setPinsParent={() => {}}
            />
        );
        // Wait for the useEffect to re-initialize coordinates
        await waitFor(() => {
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        }
        );
    });

    it('should update pins when count decreases', async () => {

        let pinCount = 5;          
        const { getByTestId, getAllByTestId, rerender } = render(
            <PinOverlay
                count={pinCount}
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
                setPinsParent={() => {}}
            />
        );
        // Wait for the useEffect to re-initialize coordinates
        await waitFor(() => {
            const pins = getAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(pinCount);
        }
        );
    });

    it('should handle rapid count changes correctly', async () => {
        
        
        const { getAllByTestId, rerender } = render(
            <PinOverlay
                count={3}
                setPinsParent={() => {}}
            />
        );
        
        await waitFor(() => {
            expect(getAllByTestId('pin-with-draggable').length).toBe(3);
        });
        
        rerender(<PinOverlay count={10} setPinsParent={() => {}} />);
        rerender(<PinOverlay count={2} setPinsParent={() => {}} />);
        
        await waitFor(() => {
            expect(getAllByTestId('pin-with-draggable').length).toBe(2);
        });
    });

    it('should have a new set of pins when image changes', async () => {
       
        const setPinsParent = jest.fn();
        
        render(
            <PinOverlay
                count={4}
                setPinsParent={setPinsParent}
            />
        );
        
        await waitFor(() => {
            expect(setPinsParent).toHaveBeenCalledTimes(2); // Initial render
            // once when mounted, then once after pins are generated
        });


        
        //  Trigger the 'canvasDrawn' event to simulate an image change.
        //  Find the registered 'canvasDrawn' event handler and call it to simulate the event.
        //  Since we mocked the 'on' method, we can inspect its calls to find our handler.
        //  It's call is recorded as an array where element 0 is the event name
        //  and element 1 is the handler function. [ ['canvasDrawn', handler], ... ].
        
        const canvasEventCalls = (mockCanvasInstance.on as jest.Mock).mock.calls;
        // find the call for 'canvasDrawn'
        const canvasDrawnCall = canvasEventCalls.find(call => call[0] === 'canvasDrawn');
        expect(canvasDrawnCall).toBeDefined();
        // get the handler function from that call
        const canvasDrawnHandler = canvasDrawnCall?.[1];
        expect(typeof canvasDrawnHandler).toBe('function');
        act(() => {
            // any code that causes state updates should be wrapped in act()
            // so that React processes all updates before we make assertions
            canvasDrawnHandler();
        });

        await waitFor(() => {
            expect(setPinsParent).toHaveBeenCalledTimes(3);
        });
    });

    it('should update correct pin color when a pin is dragged', async () => {
        // in this case, we can find out what pin was dragged/what color it was set to
        // by viewing the calls to setPinsParent. Each time a pin is dragged, PinOverlay calls setPinsParent
        // with the updated pins array that we can look at to verify

        pinOnDragHandlers.clear(); // Reset

        const setPinsParent = jest.fn();

        const { getAllByTestId } = render(
            <PinOverlay
                count={2}
                setPinsParent={setPinsParent}
            />
        );

        // Wait for pins to render
        await waitFor(() => {
            expect(getAllByTestId('pin-with-draggable').length).toBe(2);
            expect(setPinsParent).toHaveBeenCalled();
        });

        // amount of times setPinsParent was called (our implementation starts with 2)
        const initialCallCount = setPinsParent.mock.calls.length;

        // get initial pins array
        // setPinsParent.mock.calls is an array of all calls to setParent that have happened
        // so far; each call is stored as an array of arguments
        // [ [arg1, arg2, ...], [arg1, arg2, ...], ... ]
        // our case: we only pass one argument (the pins array), so we access index 0
        const initialPins = setPinsParent.mock.calls.at(-1)?.[0] as ImagePinTestType[];
        expect(Array.isArray(initialPins)).toBe(true);
        const firstPinId = initialPins[0].id;

        // Get the handleDrag callback for the first pin
        const handleDrag = pinOnDragHandlers.get(firstPinId);
        expect(handleDrag).toBeDefined();

        // Simulate a drag event with a new color
        const newColor = { r: 255, g: 128, b: 64 };
        if (!handleDrag) {
            throw new Error('handleDrag is undefined');
        }
        act(() => {
            handleDrag(
                {},           // event (not used)
                newColor,     // picked color
                firstPinId    // pin id
            );
        });

        // Verify setPinsParent was called again with the updated pin
        await waitFor(() => {
            expect(setPinsParent).toHaveBeenCalledTimes(initialCallCount + 1);

            // get the last call's first argument (the updated pins array)
            const updatedPins = setPinsParent.mock.calls.at(-1)?.[0] as ImagePinTestType[];
            const updatedPin = updatedPins.find((p: ImagePinTestType) => p.id === firstPinId);

            // expect(updatedPin).toBeDefined();
            // expect(updatedPin!.color).toBeDefined();
            if (!updatedPin?.color) {
                throw new Error('Updated pin or color is undefined');
            }
            expect(updatedPin.color.r).toBe(255);
            expect(updatedPin.color.g).toBe(128);
            expect(updatedPin.color.b).toBe(64);
        });
    });

    it('should be able to update multiple pins independently', async () => {
        pinOnDragHandlers.clear(); // Reset on drag handlers for new pins
        const setPinsParent = jest.fn();

        const { getAllByTestId } = render(
            <PinOverlay
                count={2}
                setPinsParent={setPinsParent}
            />
        )

        const pinsArray = setPinsParent.mock.calls.at(-1)?.[0] as ImagePinTestType[];
        expect(pinsArray.length).toBe(2);
        const [pin1, pin2] = pinsArray;
        const handleDrag1 = pinOnDragHandlers.get(pin1.id);
        const handleDrag2 = pinOnDragHandlers.get(pin2.id);
        expect(handleDrag1).toBeDefined();
        expect(handleDrag2).toBeDefined();

        act(() => {
            // Drag first pin
            if (handleDrag1) {
                handleDrag1({}, { r: 10, g: 20, b: 30 }, pin1.id);
            }
            // Drag second pin
            if (handleDrag2) {
                handleDrag2({}, { r: 200, g: 210, b: 220 }, pin2.id);
            }
        });

        // Verify both pins updated correctly
        await waitFor(() => {
            // get the last call's first argument (the updated pins array)
            const updatedPins = setPinsParent.mock.calls.at(-1)?.[0] as ImagePinTestType[];
            const updatedPin1 = updatedPins.find((p: ImagePinTestType) => p.id === pin1.id);
            const updatedPin2 = updatedPins.find((p: ImagePinTestType) => p.id === pin2.id);
            expect(updatedPin1?.color).toEqual({ r: 10, g: 20, b: 30 });
            expect(updatedPin2?.color).toEqual({ r: 200, g: 210, b: 220 });
        });

    });

    it('should not generate pins if canvas is not ready', async () => {


        mockCanvasInstance.getBounds = jest.fn(() => ({ width: 0, height: 0 }));
        const { getByTestId, queryAllByTestId } = render(
            <PinOverlay
                count={5}
                setPinsParent={() => {}}
            />
        )
        await waitFor(() => {
            const pinOverlay = getByTestId('pin-overlay-test');
            expect(pinOverlay).toBeInTheDocument();
            const pins = queryAllByTestId('pin-with-draggable'); 
            expect(pins.length).toBe(0); 
        });
    });

    it('should remove canvas event listener on unmount', async () => {
        const canvasOff = mockCanvasInstance.off as jest.Mock;
        
        const { unmount } = render(
            <PinOverlay
                count={3}
                setPinsParent={() => {}}
            />
        );
        
        await waitFor(() => {
            expect(mockCanvasInstance.on).toHaveBeenCalledWith('canvasDrawn', expect.any(Function));
        });
        
        unmount();
        
        expect(canvasOff).toHaveBeenCalledWith('canvasDrawn', expect.any(Function));
    });
})