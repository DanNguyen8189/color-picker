import React, { useCallback, useState } from 'react';
import Slider from './Slider';
import SliderTwo from './SliderTwo';
import type { number } from 'astro:schema';

function Home(){
    const [value, setValue] = useState(1);
    const [count, setCount] = useState(0);

    // const handleCallback = (childData:number) => {
    //     setValue(childData);
    //     console.log(value)
    // };

    const handleCallback = () => {
        console.log("callback called");
    };

    const handleClick = (num:number) => {
        // 👇️ take the parameter passed from the Child component
        setCount(current => current + num);

        console.log('argument from Child: ', num);
    };

    return (
        // <Slider onChange={handleCallback} />
        // <Slider sendData={handleCallback} />
        <div>
            <Slider handleClick={handleClick} />
            {/* <SliderTwo /> */}
        </div>
    )

}
export default Home;