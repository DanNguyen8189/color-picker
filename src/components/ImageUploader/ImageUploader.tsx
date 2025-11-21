import React, { useRef, useState, useEffect } from 'react';
import { useCanvas } from '../../util/';
// export function ImageUploader({ handlePickImage }: { handlePickImage: (image: File) => void }) {
export const ImageUploader: React.FC = () => {
    const { writeImage } = useCanvas();
    return (
        <div>
            <label htmlFor="file">Choose Image</label>
            <input
                type="file"
                name="myImage"
                accept="image/*"
                // Event handler to capture file selection and update the state
                onChange={async(event) => {
                    if (!event.target.files) return;
                    let image = event.target.files[0]
                    // defer until canvas element is mounted
                    requestAnimationFrame(() => writeImage(image));
                }}
            />
        </div>
    );

};


// export default ImageUploader;

// import React from 'react';
// import { useCanvas } from '../../util/';

// export const ImageUploader: React.FC = () => {
//     const { writeImage } = useCanvas();

//     const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         await writeImage(file);
//     };

//     return <input type="file" accept="image/*" onChange={onFileChange} />;
// };