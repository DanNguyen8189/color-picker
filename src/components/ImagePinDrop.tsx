import React, { useState } from "react";
interface image {
  image: File;
}
const ImagePinDrop = (props:image) => {

interface Pin {
  x: number;
  y: number;
}
const [pins, setPins] = useState<Pin[]>([]);

interface ImageClickEvent extends React.MouseEvent<HTMLImageElement> {}

const handleImageClick = (e: ImageClickEvent) => {
  const node = e.target as HTMLElement;
  const rect = node.getBoundingClientRect();
  const x: number = e.clientX - rect.left; // X-coordinate relative to the image
  const y: number = e.clientY - rect.top;  // Y-coordinate relative to the image

  setPins([...pins, { x, y }]);
  console.log(pins);
};

return (
  <div style={{ position: "relative", display: "inline-block" }}>
    <img
      src={URL.createObjectURL(props.image)}
      alt="Example"
      onClick={handleImageClick}
      style={{ width: "100%", height: "auto" }}
    />
    {pins.map((pin, index) => (
      <div
        key={index}
        style={{
          position: "absolute",
          top: `${pin.y}px`,
          left: `${pin.x}px`,
          width: "10px",
          height: "10px",
          backgroundColor: "red",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    ))}
  </div>
);
};

export default ImagePinDrop;