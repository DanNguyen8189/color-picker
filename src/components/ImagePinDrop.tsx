import React, { useState } from "react";
import type {ImagePin} from "./Types";
import type {Image} from "./Types";

// the image needed to be passed in as a interface prop to avoid Type '{ props: File; }' is not assignable to type 'IntrinsicAttributes & File'.
// that occurs in the parent component when attempting to pass in the image file directly. Found here: 
// https://stackoverflow.com/questions/48240449/type-is-not-assignable-to-type-intrinsicattributes-intrinsicclassattribu

// Define the props type
type ChildProps = {
    props: Image;
    handlePins: (pins:ImagePin[])=>void;
};
const ImagePinDrop = ({props, handlePins}: ChildProps) => {
//const ImagePinDrop = ({props:Image, {handlePins}:{handlePins : (pins:Pin[])=>void}}) => {

const [pins, setPins] = useState<ImagePin[]>([]);

interface ImageClickEvent extends React.MouseEvent<HTMLImageElement> {}

const handleImageClick = (e: ImageClickEvent) => {
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    const x: number = e.clientX - rect.left; // X-coordinate relative to the image
    const y: number = e.clientY - rect.top;  // Y-coordinate relative to the image

    const imagePin = {
        id: crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,7),
        positionX: x,
        positionY: y,
        draggable: true,
    };
    setPins([...pins, imagePin]);
    handlePins(pins);
    // console.log(pins);
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
                top: `${pin.positionY}px`,
                left: `${pin.positionX}px`,
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