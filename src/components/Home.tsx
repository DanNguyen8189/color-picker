import React, { useCallback, useState } from 'react';
import Slider from './Slider';
import ImageUploader from './ImageUploader';
import ImagePinDrop from './ImagePinDrop';
import SliderTwo from './SliderTwo';
import type { number } from 'astro:schema';

import type {Pin} from "./Types";

function Home(){
    const [count, setCount] = useState(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [pins, setPins] = useState<Pin[]>([]);

    // const handleCallback = (childData:number) => {
    //     setValue(childData);
    //     console.log(value)
    // };

    const handleCallback = () => {
        console.log("callback called");
    };

    const handleSlide = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(current => current + num);

        console.log('argument from Child: ', num);
    };

    const handlePickImage = (image:File) => {
        setSelectedImage(image);
    }

    const handlePins = (pins:Pin[]) => {
        setPins(pins);
        console.log(pins);
    }

    return (
        // <Slider onChange={handleCallback} />
        // <Slider sendData={handleCallback} />
        <div>
            <Slider handleSlide={handleSlide} />
            <ImageUploader handlePickImage={handlePickImage}/>
            {/* {selectedImage && (
                <div>
                <img
                    alt="not found"
                    width={"250px"}
                    src={URL.createObjectURL(selectedImage)}
                />
                <br /> <br />
                <button onClick={() => setSelectedImage(null)}>Remove</button>
                </div>
            )} */}
            {/* <SliderTwo /> */}

            {selectedImage && (
                <ImagePinDrop props={{ image: selectedImage }} handlePins={handlePins}/>
            )}
            {/* <ImagePinDrop image={selectedImage}/> */}
        </div>
    )

}
export default Home;