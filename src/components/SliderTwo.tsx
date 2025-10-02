import React, { useState } from 'react';
// function Slider({sendData}: {sendData: (value:number) => void}) {
function SliderTwo() {
   const [value, setValue] = useState(1);

   return (
       <div>
           <input
               type="range"
               min="1"
               max="10"
               value={value}
               onChange={(e) => setValue(+e.target.value)}
           /> 
           <p>Color count: {value}</p>
    </div>
   );
}
export default SliderTwo;