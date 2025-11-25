import React from 'react';
import type { ImagePin } from '../../util/Types';
import { rgbToString, rgbToHex, type RGB } from '../../util/Types';
import './Palette.scss';

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
        <div className="palette-container">
            <p className="palette-text">Open your pallete in Coolors!</p>
            <p className="palette-text"><a href={getCoolorsUrl(Pins)} target="_blank" rel="noopener noreferrer">View Palette</a></p>
            <div className="palette-grid">
            {Pins.map((pin) => (
                <div key={pin.id} className="swatch" style={{ width: '100px', height: '100px', margin: '5px' }}>
                    <div className="swatch-color" style={{ backgroundColor: rgbToString(pin.color) }}></div>
                    <div className="swatch-label">
                    <p>{rgbToString(pin.color)}</p>
                    <p>{rgbToHex(pin.color)}</p>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}