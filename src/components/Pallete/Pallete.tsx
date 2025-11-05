import React from 'react';
import type { ImagePin } from '../Types';
import { rgbToString, rgbToHex, type RGB } from '../Types';

type PaletteProps = {
    Pins: ImagePin[]
}

export const Palette: React.FC<PaletteProps> = ({ Pins }) => {

    function getCoolorsUrl(pins: ImagePin[]): string {
        const baseUrl = 'https://coolors.co/';
        const hexColors = pins.map(pin => rgbToHex(pin.color).replace('#', ''));
        return `${baseUrl}${hexColors.join('-')}`;
    }

    return (
        <div>
            <p>Open your pallete in Coolors!</p>
            <p><a href={getCoolorsUrl(Pins)} target="_blank" rel="noopener noreferrer">View Palette</a></p>
            {Pins.map((pin) => (
                <div key={pin.id} style={{ backgroundColor: rgbToString(pin.color), width: '100px', height: '100px', margin: '5px' }}>
                    <p>{rgbToString(pin.color)}</p>
                    <p>{rgbToHex(pin.color)}</p>
                </div>
            ))}
        </div>
    );
}