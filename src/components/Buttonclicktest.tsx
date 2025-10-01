import React, { useState } from 'react';

function Buttonclicktest() {
    const [message, setMessage] = useState('');

    const handleClick = () => {
        alert("Button was clicked!");
        setMessage('Button was clicked!');
    };

    return (
        <div>
        <button onClick={handleClick}>Click Me</button>
        {message && <p>{message}</p>}
        </div>
    );
}

export default Buttonclicktest;