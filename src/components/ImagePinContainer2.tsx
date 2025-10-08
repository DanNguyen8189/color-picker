import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// react-draggable is dynamically imported on the client only to avoid SSR errors
// react-xarrows is client-only; we'll dynamically import it to avoid SSR evaluating the UMD bundle
// and causing errors during server-side rendering.
let Xarrow: any = null;
let Xwrapper: any = null;
let useXarrow: any = null;

export interface ImagePin {
  positionX: number;
  positionY: number;
  id: string;
  draggable?: boolean;
}

export interface NewPinEvent {
  positionX: number;
  positionY: number;
}

export interface ImagePinContainerProps {
  image: string;
  imageAlt?: string;
  pins?: ImagePin[];
  customPinComponent?: (pin: ImagePin) => React.ReactElement;
  arrow?: Omit<React.ComponentProps<typeof Xarrow>, "start" | "end">;
  onNewPin?: (event: NewPinEvent) => void;
  onExistingPin?: (event: ImagePin) => void;
  draggable?: boolean;
  onDraggedPin?: (pin: ImagePin) => void;
}

export interface ImagePinContainerRef {
  rerender: () => void;
}

export const ImagePinContainer2 = forwardRef<
  ImagePinContainerRef,
  ImagePinContainerProps
>(
  (
    {
      pins = [],
      image,
      imageAlt = "Image",
      customPinComponent,
      arrow,
      onNewPin,
      onExistingPin,
      draggable = false,
      onDraggedPin,
    },
    forwardedRef,
  ) => {
    const ref = useRef<HTMLImageElement>(null);
    const [mounted, setMounted] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [xarrowsLoaded, setXarrowsLoaded] = useState(false);
    const xarrowsRef = useRef<{ updateArrows?: () => void } | null>(null);

    useEffect(() => {
      let mounted = true;
      import('react-xarrows').then((mod) => {
        if (!mounted) return;
  Xarrow = mod.default || mod;
  Xwrapper = mod.Xwrapper || mod.Xwrapper || null;
  useXarrow = mod.useXarrow || null;
        // if useXarrow exists, call it to get update function
        if (useXarrow) {
          try {
            const updater = useXarrow();
            xarrowsRef.current = { updateArrows: updater };
          } catch (e) {
            // useXarrow may rely on hooks; we'll call it inside render path if possible
            xarrowsRef.current = {};
          }
        }
        setXarrowsLoaded(true);
      }).catch(() => {
        setXarrowsLoaded(false);
      });
      return () => { mounted = false; };
    }, []);

    const updateArrows = () => {
      if (xarrowsRef.current && typeof xarrowsRef.current.updateArrows === 'function') {
        xarrowsRef.current.updateArrows();
      }
    };

    useImperativeHandle(
      forwardedRef,
      () => {
        return {
          rerender: () => {
            setMounted(false);
          },
        };
      },
      [],
    );

  const handleDrag = (e: any, pin: ImagePin) => {
      if (dragging) {
        const { positionX, positionY, error } = handleMouseEvent(
          e as React.MouseEvent,
        );

        if (!error && !!onDraggedPin) {
          const newPin = { ...pin, positionX, positionY };
          onDraggedPin(newPin);
        }

        updateArrows();
        setTimeout(function () {
          setDragging(false);
        }, 150);
      }
    };

    const handleMouseEvent = (
      event: React.MouseEvent,
    ): { error: boolean; positionX: number; positionY: number } => {
      if (!ref.current || !onNewPin) {
        return { error: true, positionX: 0, positionY: 0 };
      }

      const { left, top } = ref.current.getBoundingClientRect();
      const positionX =
        ((event.clientX - left) / ref.current.clientWidth) * 100;
      const positionY =
        ((event.clientY - top) / ref.current.clientHeight) * 100;
      return { error: false, positionX: positionX, positionY: positionY };
    };

    const handleNewPin = (event: React.MouseEvent) => {
      if (!dragging) {
        const { positionX, positionY, error } = handleMouseEvent(event);
        if (!error && onNewPin) {
          onNewPin({ positionX, positionY });
          updateArrows();
        }
      }
    };

    const handleExistingPinClick = (event: React.MouseEvent, pin: ImagePin) => {
      if (!onExistingPin || dragging) return;

      event.stopPropagation();
      onExistingPin(pin);
    };

    useEffect(() => {
      if (!ref.current) return;
      const resizeObserver = new ResizeObserver(() => {
        if (
          ref.current &&
          ref.current.clientHeight > 0 &&
          ref.current.clientWidth > 0
        ) {
          setMounted(true);
        }
      });
      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }, [mounted]);

    const [Draggable, setDraggable] = useState<any>(null);

    useEffect(() => {
      let mounted = true;
      // load react-draggable only on the client
      import('react-draggable').then((mod) => {
        if (mounted) setDraggable(() => mod.default || mod);
      }).catch(() => {
        // ignore; we'll render non-draggable pins
      });
      return () => { mounted = false; };
    }, []);

  //   const Component1 = React.forwardRef(function (props, ref) {
//     return <div {...props} ref={ref}>Nested component</div>;
//   });
    return (
      <div className="m-0 relative w-full h-full" onClick={handleNewPin}>
        <img src={image} alt={imageAlt} ref={ref} className="w-full h-full" />
        {(xarrowsLoaded && Xwrapper) ? (
          <Xwrapper>
          {mounted &&
            pins.map((pin, i) => (
              <>
                {draggable && pin.draggable && Draggable ? (
                  // create a per-pin ref for nodeRef
                  (() => {
                    const nodeRef = React.createRef<HTMLDivElement>();
                    return (
                      <Draggable
                        nodeRef={nodeRef}
                        bounds="parent"
                        onDrag={() => setDragging(true)}
                        onStop={(e: any) => handleDrag(e, pin)}
                      >
                        <div
                          ref={nodeRef}
                          id={`pin-${i}`}
                          className="absolute"
                          onClick={(e) => handleExistingPinClick(e, pin)}
                          style={{
                            left: `${pin.positionX}%`,
                            top: `${pin.positionY}%`,
                          }}
                        >
                          {customPinComponent ? (
                            customPinComponent(pin)
                          ) : (
                            <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </Draggable>
                    );
                  })()
                ) : (
                  <div
                    id={`pin-${i}`}
                    className="absolute"
                    onClick={(e) => handleExistingPinClick(e, pin)}
                    style={{
                      left: `${pin.positionX}%`,
                      top: `${pin.positionY}%`,
                    }}
                  >
                    {customPinComponent ? (
                      customPinComponent(pin)
                    ) : (
                      <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}
                {arrow && i > 0 && xarrowsLoaded && Xarrow && (
                  <Xarrow {...arrow} start={`pin-${i - 1}`} end={`pin-${i}`} />
                )}
              </>
            ))}
          </Xwrapper>
        ) : (
          <>
            {mounted &&
              pins.map((pin, i) => (
                <React.Fragment key={pin.id}>
                  {draggable && pin.draggable && Draggable ? (
                    (() => {
                      const nodeRef = React.createRef<HTMLDivElement>();
                      return (
                        <Draggable
                          nodeRef={nodeRef}
                          bounds="parent"
                          onDrag={() => setDragging(true)}
                          onStop={(e: any) => handleDrag(e, pin)}
                        >
                          <div
                            ref={nodeRef}
                            id={`pin-${i}`}
                            className="absolute"
                            onClick={(e) => handleExistingPinClick(e, pin)}
                            style={{
                              left: `${pin.positionX}%`,
                              top: `${pin.positionY}%`,
                            }}
                          >
                            {customPinComponent ? (
                              customPinComponent(pin)
                            ) : (
                              <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                        </Draggable>
                      );
                    })()
                  ) : (
                    <div
                      id={`pin-${i}`}
                      className="absolute"
                      onClick={(e) => handleExistingPinClick(e, pin)}
                      style={{
                        left: `${pin.positionX}%`,
                        top: `${pin.positionY}%`,
                      }}
                    >
                      {customPinComponent ? (
                        customPinComponent(pin)
                      ) : (
                        <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))}
          </>
        )}
      </div>
    );
  },
);