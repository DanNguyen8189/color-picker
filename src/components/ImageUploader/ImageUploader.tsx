import React, { useRef, useState, useEffect } from 'react';
import { useCanvas } from '../../util/';
import { set } from 'astro:schema';
// export function ImageUploader({ handlePickImage }: { handlePickImage: (image: File) => void }) {
export const ImageUploader: React.FC = () => {
    const { writeImage } = useCanvas();
    //const [selectedImage, setSelectedImage] = useState<string>('');
    const prevUrlRef = useRef<string | null>(null);

    useEffect(() => () => {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    }, []);

    return (
        <div>
        {/* Header */}
        {/* <h1>Upload and Display Image</h1>
        <h3>using React Hooks</h3> */}

        {/* Conditionally render the selected image if it exists */}
        {/* <Image/> */}
        <br />

        {/* Input element to select an image file */}
        <input
            type="file"
            name="myImage"
            accept="image/*"
            // Event handler to capture file selection and update the state
            onChange={async(event) => {
                if (!event.target.files) return;
                let image = event.target.files[0]
                //console.log(image); // Log the selected file
                //setSelectedImage(image); // Update the state with the selected file
                //handlePickImage(image);
                const url = URL.createObjectURL(image);
                if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
                prevUrlRef.current = url;
                //setSelectedImage(url);
                //setImageUrl(url);
                // defer until canvas element is mounted
                requestAnimationFrame(() => writeImage(url));
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