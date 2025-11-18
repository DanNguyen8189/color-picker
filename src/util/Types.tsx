export interface RGB { 
    r: number, 
    g: number, 
    b: number, 
};

export interface ImagePin {
    id: string,
    color?: RGB,
    coordinates: Coordinates, // right now, these are initial random coords. Dragging
    // doesn't change these, but we can change that if needed.
}

export interface Image {
    image: File,
}


export interface Coordinates {
    x: number,
    y: number,
}

export function rgbToHex(rgb: RGB | undefined): string {
    if (!rgb) return "#000000";
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b)
        .toString(16)
        .slice(1)
        .toUpperCase();
}

export function rgbToString(rgb: RGB | undefined): string {
    if (!rgb) return 'rgb(0, 0, 0)';
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}