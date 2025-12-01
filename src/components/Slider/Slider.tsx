import  { useState } from 'react';
import './Slider.scss';
function Slider({handleSlide}: {handleSlide: (value:number) => void}) {
    const [value, setValue] = useState(4);

    return (
        <div className='slider-container'>
           {/* <input
               type="range"
               min="1"
               max="10"
               value={value}
               onChange={(e) => setValue(+e.target.value)}
           />  */}
            <label className="slider-text">Color Count: </label>
            <input 
                className="slider-input"
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
            <label className="slider-value">{value}</label>
    </div>
   );
}
export default Slider;