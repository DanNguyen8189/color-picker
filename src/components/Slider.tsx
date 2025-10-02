import React, { useState } from 'react';
// function Slider({sendData}: {sendData: (value:number) => void}) {
function Slider({handleClick}: {handleClick: (value:number) => void}) {
   const [value, setValue] = useState(1);

   return (
    //    <div>
    //        {/* <input
    //            type="range"
    //            min="1"
    //            max="10"
    //            value={value}
    //            onChange={(e) => setValue(+e.target.value)}
    //        /> */}
            <input 
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => handleClick(+e.target.value)}
            />
    //        <p>Color count: {value}</p>
    //    </div>
    // <div>
    //   <button onClick={event => handleClick(100)}>Click</button>
    // </div>
   );
}
export default Slider;