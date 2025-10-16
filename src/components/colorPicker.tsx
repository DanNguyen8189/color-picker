import React, { useRef, useState } from "react";

const ColorPicker = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");

    interface HandleImageLoadEvent extends React.SyntheticEvent<HTMLImageElement, Event> {}

    const handleImageLoad = (e: HandleImageLoadEvent): void => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext("2d");
        if (ctx === null) return;
        const img = e.target as HTMLImageElement;

        // Draw the image onto the canvas
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext("2d");
        if (ctx === null) return;

        // Get click position
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get pixel data
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

        setSelectedColor(color);
    };

    return (
        <div>
        <h3>Pick a Color from the Image</h3>
        <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ border: "1px solid black" }} />
        <img
            src="https://via.placeholder.com/300"
            alt="Sample"
            onLoad={handleImageLoad}
            style={{ display: "none" }}
        />
        <p>Selected Color: <span style={{ color: selectedColor }}>{selectedColor}</span></p>
        </div>
    );
};

export default ColorPicker;