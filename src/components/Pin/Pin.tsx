// import type { ImagePin } from "../Types"
// import React, { useEffect, useRef, useState } from "react";
// export function Pin(ref: React.Ref<HTMLDivElement>, pin: ImagePin, {handleDrag}: {handleDrag?: (e: any, data: any, id: string) => void} = {}) {

//     const [Draggable, setDraggable] = useState<any>(null);
//     // Dynamically import react-draggable to avoid SSR issues
//     useEffect(() => {
//         let mounted = true;
//         // load react-draggable only on the client
//         import('react-draggable').then((mod) => {
//             if (mounted) setDraggable(() => mod.default || mod);
//         }).catch(() => {
//             // ignore; we'll render non-draggable pins
//         });
//     return () => { mounted = false; };
//     }, []);

//     return(
        
//         // <div ref={ref}
//         // style={{
//         //     position: 'absolute',
//         //     width: '15px',
//         //     height: '15px',
//         //     border: '2px solid white',
//         //     backgroundColor: pin.color || 'red',
//         //     borderRadius: '50%',
//         //     zIndex: 9999,
//         //     pointerEvents: 'auto', // allow clicking/drags on the pin itself
//         // }}>

//         // </div>

//         <Draggable
//             axis='both'
//             bounds='parent'
//             defaultPosition={{ x: pin.positionX, y: pin.positionY }}
//             nodeRef={ref}
//             onDrag={(e: any, data: any) => handleDrag?.(e, data, pin.id)}
//             //onStop={(e: any, data: any) => handleDrag(canvasRef, e, data, pin.id)}
//         >
//             <div
//                 ref={ref}
//                 style={{
//                     position: 'absolute',
//                     width: '15px',
//                     height: '15px',
//                     border: '2px solid white',
//                     backgroundColor: pin.color || 'red',
//                     borderRadius: '50%',
//                     zIndex: 9999,
//                     pointerEvents: 'auto', // allow clicking/drags on the pin itself
//                 }}
//             />
//         </Draggable>
//     )
// }

import React from 'react';
// import Draggable from 'react-draggable';
import type { ImagePin } from '../Types';
import { useEffect, useState } from 'react';

type PinProps = {
    Draggable: any  // for dynamic import of react-draggable. Didn't want to
    // import it directly in Pin component because we'd be running it for every Pin
    pinRef: React.RefObject<HTMLDivElement | null>,
    pin: ImagePin,
    onDrag: (e: any, data: any) => void
}

export const Pin: React.FC<PinProps> = ({ Draggable, pinRef, pin, onDrag }) => {
    // const [Draggable, setDraggable] = useState<any>(null);
    // // Dynamically import react-draggable to avoid SSR issues
    // useEffect(() => {
    //     let mounted = true;
    //     // load react-draggable only on the client
    //     import('react-draggable').then((mod) => {
    //         if (mounted) setDraggable(() => mod.default || mod);
    //     }).catch(() => {
    //         // ignore; we'll render non-draggable pins
    //     });
    // return () => { mounted = false; };
    // }, []);

    // Return static pin while Draggable is loading
    if (!Draggable) {
        return (
            <div
                ref={pinRef}
                style={{
                    position: 'absolute',
                    width: '15px',
                    height: '15px',
                    border: '2px solid white',
                    backgroundColor: pin.color || 'red',
                    borderRadius: '50%',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    left: pin.positionX,
                    top: pin.positionY,
                }}
            />
        );
    }

    // Once Draggable is loaded, return draggable pin
    return (
        <Draggable
            key={pin.id}
            axis='both'
            bounds='parent'
            defaultPosition={{ x: pin.positionX, y: pin.positionY }}
            nodeRef={pinRef}
            onDrag={onDrag}
        >
            <div
                ref={pinRef}
                style={{
                    position: 'absolute',
                    width: '15px',
                    height: '15px',
                    border: '2px solid white',
                    backgroundColor: pin.color || 'red',
                    borderRadius: '50%',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                }}
            />
        </Draggable>
    );

    // return (
    //     <Draggable
    //         key={pin.id}
    //         axis='both'
    //         bounds='parent'
    //         defaultPosition={{ x: pin.positionX, y: pin.positionY }}
    //         nodeRef={pinRef}
    //         onDrag={onDrag}
    //     >
    //         <div
    //             ref={pinRef}
    //             style={{
    //                 position: 'absolute',
    //                 width: '15px',
    //                 height: '15px',
    //                 border: '2px solid white',
    //                 backgroundColor: pin.color || 'red',
    //                 borderRadius: '50%',
    //                 zIndex: 9999,
    //                 pointerEvents: 'auto',
    //             }}
    //         />
    //     </Draggable>
    // );
};