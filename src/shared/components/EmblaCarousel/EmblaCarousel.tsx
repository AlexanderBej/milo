import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { clsx } from "clsx";

import styles from "./EmblaCarousel.module.scss";

export type EmblaCarouselProps = {
  children: ReactNode;
  className?: string;
  options?: EmblaOptionsType;
  showDots?: boolean;
};

export const EmblaCarousel = ({
  children,
  className,
  options,
  showDots = true,
}: EmblaCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    ...options,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const syncSnapCount = useCallback((api: EmblaCarouselType) => {
    setSnapCount(api.scrollSnapList().length);
  }, []);

  const syncSelectedIndex = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const handleReInit = () => {
      syncSnapCount(emblaApi);
      syncSelectedIndex(emblaApi);
    };

    const handleSelect = () => {
      syncSelectedIndex(emblaApi);
    };

    handleReInit();

    emblaApi.on("reInit", handleReInit);
    emblaApi.on("select", handleSelect);

    return () => {
      emblaApi.off("reInit", handleReInit);
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, syncSelectedIndex, syncSnapCount]);

  return (
    <div className={clsx(styles.embla, className)}>
      <div className={styles.viewport} ref={emblaRef}>
        <div className={styles.container}>
          {React.Children.map(children, (child, index) => (
            <div className={styles.slide} key={index}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {showDots && snapCount > 1 ? (
        <div className={styles.controls}>
          <div className={styles.dots} aria-label="Carousel pagination">
            {Array.from({ length: snapCount }).map((_, index) => (
              <button
                aria-current={index === selectedIndex ? "true" : undefined}
                aria-label={`Go to slide ${String(index + 1)}`}
                className={clsx(
                  styles.dot,
                  index === selectedIndex && styles.dotActive,
                )}
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
