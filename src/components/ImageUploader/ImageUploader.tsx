import React, { useRef, useState, useEffect } from 'react';
import { useCanvas } from '../../util/';
import './ImageUploader.scss';
import defaultImage from '../../assets/Nightshade.png';

// export function ImageUploader({ handlePickImage }: { handlePickImage: (image: File) => void }) {
export const ImageUploader: React.FC = () => {
    const { writeImage, canvasInstance } = useCanvas();
    useEffect(() => {
        async function setDefaultImage() {
            // fetch image, create a File object from the data
            // When using a relative path (like defaultImage) in a fetch request,
            // the server tries to load it from the server relative to the current URL
            // which can fail in React apps. Use defaultImageUrl, which is Url string
            // pointing to built asset, instead.
            const defaultImageUrl = (typeof defaultImage === 'string') ? defaultImage : (defaultImage.src ?? '');
            const response = await fetch(defaultImageUrl);
            const blob = await response.blob();
            const file = new File([blob], "Nightshade.png", { type: blob.type });
            writeImage(file);
        }
        setDefaultImage();
    }, [canvasInstance]);
    return (
        <div className='image-uploader'>
            <label className="choose-image-txt"htmlFor="file">Choose Image</label>
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