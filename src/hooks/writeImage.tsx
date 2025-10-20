import { useEffect, useRef, useState } from 'react'
import { Canvas, loadImageHandler } from '../util'

export function writeImage(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imgSrc: string
) {
    const canvasInstanceRef = useRef<Canvas | null>(null)
    useEffect(() => {
        if (canvasRef.current === null) return;
        if (canvasInstanceRef.current === null) {
            canvasInstanceRef.current = new Canvas(canvasRef.current!)
            //canvasInstanceRef.current.listenMovements(onMove)
        }

        const canvas = canvasInstanceRef.current

        async function initializeCanvas() {
            const image = await loadImageHandler(imgSrc)
            canvas.setDimensions(image.width, image.height)
            canvas.drawImage(image)
        }

        initializeCanvas()

        return () => {
            //canvas.cleanUp(onMove)
        }
    }, [imgSrc])

    // return {
    //     // dimensions: canvasInstanceRef.current?.getDimensions() ?? {
    //     //     width: 0,
    //     //     height: 0
    //     // }
    //     canvasInstanceRef
    // }
    return canvasInstanceRef
}