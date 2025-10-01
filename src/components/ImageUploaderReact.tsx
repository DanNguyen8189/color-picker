import { useState } from 'react';

function ImageUploader() {
    // Define a state variable to store the selected image
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [test, setTest] = useState<string | null>("what");

    // Return the JSX for rendering
    return (
        <div>
        {/* Header */}
        <h1>Upload and Display Image</h1>
        <h3>using React Hooks</h3>

        {/* Conditionally render the selected image if it exists */}
        {selectedImage && (
            <div>
            {/* Display the selected image */}
            <p>What</p>
            <img
                alt="not found"
                width={"250px"}
                src={URL.createObjectURL(selectedImage)}
            />
            <br /> <br />
            {/* Button to remove the selected image */}
            <button onClick={() => setSelectedImage(null)}>Remove</button>
            </div>
        )}
        <Image/>
        <br />

        {/* Input element to select an image file */}
        <input
            type="file"
            name="myImage"
            // Event handler to capture file selection and update the state
            onChange={async(event) => {
                if (!event.target.files) return;
                let image = event.target.files[0]
                console.log(image)

                console.log(image); // Log the selected file
                
                setSelectedImage(image); // Update the state with the selected file
            }}
        />
        <button onClick={handleClick}>button test</button>
        </div>
    );
    function handleClick(){
        console.log("wtf");
        alert("wtf");
    }

    function Image(){
        if (selectedImage){
            return (          
                <img
                    alt="not found"
                    width={"250px"}
                    src={URL.createObjectURL(selectedImage)}
                />
            )
        }
        else if (test){
            return (
                <div>
                {/* Display the selected image */}
                <p>What</p>
                <br /> <br />
                {/* Button to remove the selected image */}
                <button onClick={() => setSelectedImage(null)}>Remove</button>
                </div>
            )
        } 
    }
};


export default ImageUploader;