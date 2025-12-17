import React, { useEffect } from 'react';
import { useCanvas } from '../../util/';
import './ImageUploader.scss';
import defaultImage from '../../assets/Nightshade.png';


// Component for uploading image 

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
            console.log("useEffect running, default image set");
        }
        setDefaultImage();
    }, [canvasInstance]);
    return (
        <div className='image-uploader'>
            <input
                type="file"
                id="file-upload"
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
            {/* <label className="choose-image-txt"htmlFor="file-upload">Choose Image:</label> */}
            {/* <span id="file-name">No file selected</span> */}
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