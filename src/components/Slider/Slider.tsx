import  { useState } from 'react';
import './Slider.scss';
function Slider({handleSlide}: {handleSlide: (value:number) => void}) {
    const [value, setValue] = useState(1);

    return (
        <div className='slider-container'>
           {/* <input
               type="range"
               min="1"
               max="10"
               value={value}
               onChange={(e) => setValue(+e.target.value)}
           />  */}
            <label>Color Count: </label>
            <input 
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => {
                    setValue(+e.target.value)
                    handleSlide(+e.target.value)
                }
                }
            />
            <label>{value}</label>
    </div>
   );
}
export default Slider;