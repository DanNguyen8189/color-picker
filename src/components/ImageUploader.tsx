import { useState } from 'react';

function ImageUploader({ handlePickImage }: { handlePickImage: (image: File) => void }) {
    // Define a state variable to store the selected image
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

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


export default ImageUploader;