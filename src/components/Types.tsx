export interface ImagePin {
    id: string;
    positionX: number;
    positionY: number;
    color?: string;
    draggable?: boolean;
}

export interface Image {
    image: File;
}