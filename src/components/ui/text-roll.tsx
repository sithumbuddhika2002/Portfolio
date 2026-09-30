'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  type VariantLabels,
  type Target,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };

  onAnimationComplete?: () => void;
};

export function TextRoll({
  children,
  duration = 0.45,
  getEnterDelay = (i) => i * 0.02,
  getExitDelay = (i) => i * 0.02 + 0.03,
  className = '',
  transition = { ease: [0.22, 1, 0.36, 1] },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const [displayedText, setDisplayedText] = useState(children);
  const [prevText, setPrevText] = useState<string | null>(null);
  const [animCycle, setAnimCycle] = useState(0);
  const isFirstMount = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (children !== displayedText) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setPrevText(displayedText);
      setDisplayedText(children);
      setAnimCycle((c) => c + 1);

      const maxLen = Math.max(displayedText.length, children.length);
      const maxDelay = getExitDelay(maxLen - 1);
      const totalTimeMs = (duration + maxDelay + 0.1) * 1000;

      timerRef.current = window.setTimeout(() => {
        setPrevText(null);
        onAnimationComplete?.();
      }, totalTimeMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [children, displayedText, duration, getExitDelay, onAnimationComplete]);

  const defaultVariants = {
    enter: {
      initial: { rotateX: 0, opacity: 1, y: '0%' },
      animate: { rotateX: -90, opacity: 0, y: '-35%' },
    },
    exit: {
      initial: { rotateX: 90, opacity: 0, y: '35%' },
      animate: { rotateX: 0, opacity: 1, y: '0%' },
    },
  } as const;

  const maxLen =
    prevText !== null
      ? Math.max(prevText.length, displayedText.length)
      : displayedText.length;

  return (
    <span className={`inline-flex whitespace-nowrap overflow-hidden ${className}`}>
      {Array.from({ length: maxLen }).map((_, i) => {
        const prevChar = prevText !== null ? (prevText[i] ?? '') : null;
        const nextChar = displayedText[i] ?? '';
        const ghostChar = nextChar ? nextChar : (prevChar || '\u00A0');

        return (
          <span
            key={`slot-${i}`}
            className="relative inline-block overflow-hidden [perspective:1000px] align-baseline"
            aria-hidden="true"
          >
            {prevText !== null && (
              <motion.span
                key={`prev-${animCycle}-${i}`}
                className="absolute top-0 left-0 inline-block [backface-visibility:hidden] [transform-origin:50%_50%]"
                initial={
                  variants?.enter?.initial ?? defaultVariants.enter.initial
                }
                animate={
                  variants?.enter?.animate ?? defaultVariants.enter.animate
                }
                transition={{
                  ...transition,
                  duration,
                  delay: getEnterDelay(i),
                }}
              >
                {prevChar === ' ' ? '\u00A0' : (prevChar || '\u00A0')}
              </motion.span>
            )}

            <motion.span
              key={`next-${animCycle}-${i}`}
              className="absolute top-0 left-0 inline-block [backface-visibility:hidden] [transform-origin:50%_50%]"
              initial={
                prevText !== null
                  ? (variants?.exit?.initial ?? defaultVariants.exit.initial)
                  : { rotateX: 0, opacity: 1, y: '0%' }
              }
              animate={variants?.exit?.animate ?? defaultVariants.exit.animate}
              transition={{
                ...transition,
                duration,
                delay: prevText !== null ? getExitDelay(i) : 0,
              }}
              onAnimationComplete={
                i === maxLen - 1 && prevText !== null
                  ? () => {
                      setPrevText(null);
                      onAnimationComplete?.();
                    }
                  : undefined
              }
            >
              {nextChar === ' ' ? '\u00A0' : (nextChar || '\u00A0')}
            </motion.span>

            <span className="invisible select-none opacity-0 pointer-events-none">
              {ghostChar === ' ' ? '\u00A0' : ghostChar}
            </span>
          </span>
        );
      })}
      <span className="sr-only">{displayedText}</span>
    </span>
  );
}
