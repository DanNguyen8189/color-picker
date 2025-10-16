    // const getPixelColor = (x: number, y: number) =>{
    //     const ctx = canvasRef.current?.getContext("2d");
    //     if (!ctx || !canvasRef.current) return 'rgb(0,0,0)';
    //         const pixelData = ctx.getImageData(
    //         coordinates.x,
    //         coordinates.y,
    //         1,
    //         1
    //         ).data
    //         if (pixelData.length < 4) return 'rgb(0,0,0)' // Return black color if unable to retrieve pixel data
    
    //         const [red, green, blue] = pixelData
    //         return `rgb(${red}, ${green}, ${blue})`
    //     }