## Pin Overlay

This component’s responsible for checking if the uploaded image is ready and generating pins at correct positions, grabbing color where the pins are. It also knows which pin is actively being dragged

## Pin

This component is responsible for visually representing where the user wants to grab color from the uploaded image, and notifying PinOverlay things such as when it’s being dragged, and where.

## Pin vs PinOverlay

There was a bit of back and forth regarding what the two components above should be handling. Originally, Pin was responsible for both picking color and figuring out where it should be generated on the canvas.

However:

- Having the pin figure out where it should be on the canvas was messy. It meant each pin had to know the canvas bounds and if they got updated.
- Having the pin pick the color meant color data needed to be passed up multiple levels from pin → pinoverlay → root component, which in turn needed to pass it to the palette
- It’s a lot easier to have the pin be almost entirely visual,with the only state being its previous color. It gets its data to display (coords, color) from the parent PinOverlay.

## Canvas Class

Needed a canvas class to abstract and handle all things/functions relating to the uploaded image. Including 

- drawing the image onto the html canvas element (this is how I found out I can get images to be displayed, and *the way to get pixel data from it later*)
- picking color
- Getting image url for zoom display
- emitting an event when a canvas is drawn. I ended up adding this so that the PinOverlay component could know when it was safe to generate its Pins and start picking color

## Central Canvas context

This was added later for the specific reason of needing each pin to have access to the uploaded image url so that it could display the zoomed in version of the image on drag. I was drilling down too many props between PinOverlay and Pin and needed a way to cut it down. As soon as more than 2 components needed the canvas instance and it seemed like I was passing it around everywhere, I centralized it.

(Original setup: Image upload sets the url in the parent component, a writeImage hook gets called, which returns a canvas class instance. That canvas class instance is then used by PinOverlay.)

With this central context, each other component could access the canvas’s state directly through 

`const { canvasInstance } = useCanvas();` Instead of passing down the canvas instance down through props.

- Upload component could upload directly to it
- PinOverlay can check it to generate its pins correctly within the correct bounds, handle window resizing,
- Pin can use it to find the image uploaded to display a zoomed in version for to make it friendly for the user
- All components can check if canvas is available or not
- Using a canvas context alongside the Canvas class lets me organize, reuse, and extend canvas functionality in a modular way.

Other cases this ended being useful:

- I was able to centralize some logic here instead of having them sit out on their own. Such logic included:
- Image blob cleanup. Whenever URL.createObjectURL(url) is called, it leaves something in the browser. When a new image is uploaded, the old one should be cleaned up to avoid memory leaks. Logic for this was moved here
- writeImage, the function that handles drawing the image