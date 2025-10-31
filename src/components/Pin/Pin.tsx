import type { ImagePin } from "../Types"
export function Pin(ref: React.Ref<HTMLDivElement>, pin: ImagePin) {
    return(
        <div ref={ref}
        style={{
            position: 'absolute',
            width: '15px',
            height: '15px',
            border: '2px solid white',
            backgroundColor: pin.color || 'red',
            borderRadius: '50%',
            zIndex: 9999,
            pointerEvents: 'auto', // allow clicking/drags on the pin itself
        }}>

        </div>
    )
}