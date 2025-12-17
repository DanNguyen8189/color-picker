import React from 'react';
import type { ImagePin } from '../../util/Types';
import { rgbToString, rgbToHex, type RGB } from '../../util/Types';
import './Palette.scss';
import { set } from 'astro:schema';

// Component displays selected colors and their hexcodes

type PaletteProps = {
    Pins: ImagePin[]
}

export const Palette: React.FC<PaletteProps> = ({ Pins }) => {

    function getCoolorsUrl(pins: ImagePin[]): string {
        const baseUrl = 'https://coolors.co/';
        const hexColors = pins.map(pin => rgbToHex(pin.color).replace('#', ''));
        return `${baseUrl}${hexColors.join('-')}`;
    }

    function copyAllToClipboard(pins: ImagePin[]): void {
        const hexColors = pins.map(pin => rgbToHex(pin.color));
        const textToCopy = hexColors.join('\n');
        navigator.clipboard.writeText(textToCopy);
        showNotificationBar('Palette copied to clipboard!');
    }

    function copyToClipboard(pin: ImagePin): void {
        const hexColor = rgbToHex(pin.color);
        navigator.clipboard.writeText(hexColor);
        showNotificationBar(`Color copied to clipboard!`);
    }

    function showNotificationBar(message: string): void {
        const notificationBar = document.createElement('div');
        notificationBar.className = 'notification-bar';
        notificationBar.textContent = message;
        document.body.appendChild(notificationBar);
        notificationBar.classList.add('show');
        setTimeout(() => {  
            notificationBar.classList.remove('show');
        }, 2700);
        setTimeout(() => {  
            document.body.removeChild(notificationBar);
            // remove from DOM after .show class is removed,
            // to allow .show's exit animation to play out
        }, 3000);
    }

    return (
        <div className="palette-container">
            <button onClick={() => copyAllToClipboard(Pins)}><p className="palette-text">Copy all to clipboard</p></button>
            <p className="palette-text">Open your palette in <a href={getCoolorsUrl(Pins)} target="_blank" rel="noopener noreferrer">Coolors.co</a></p>
            {/* <p className="palette-text" >Copy to clipboard</p> */}
            {/* <button onClick={() => copyToClipboard(Pins)}><p className="palette-text">Copy to clipboard</p></button> */}
            {Pins.length > 0 &&<div className="palette-grid">
            {Pins.map((pin) => (
                <div key={pin.id} onClick={() => copyToClipboard(pin)} className="swatch fade-in fade-out">
                    <div className="swatch-color" style={{ backgroundColor: rgbToString(pin.color) }}>
                    </div>
                    <div className="swatch-label">
                        {/* {rgbToString(pin.color)} */}
                        {rgbToHex(pin.color)}
                    </div>
                </div>
            ))}
            </div>}
        </div>
    );
}