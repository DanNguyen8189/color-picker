export function ImageUploader({ handlePickImage }: { handlePickImage: (image: File) => void }) {

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
                console.log(image); // Log the selected file
                //setSelectedImage(image); // Update the state with the selected file
                handlePickImage(image);
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