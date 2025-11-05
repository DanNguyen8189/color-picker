import React from 'react';
import type { ImagePin } from '../Types';
import { rgbToString, rgbToHex, type RGB } from '../Types';

type PaletteProps = {
    Pins: ImagePin[]
}

export const Palette: React.FC<PaletteProps> = ({ Pins }) => {


    return (
        <div>
            {Pins.map((pin) => (
                <div key={pin.id} style={{ backgroundColor: rgbToString(pin.color), width: '100px', height: '100px', margin: '5px' }}>
                    <p>{rgbToString(pin.color)}</p>
                    <p>{rgbToHex(pin.color)}</p>
                </div>
            ))}
        </div>
    );
}