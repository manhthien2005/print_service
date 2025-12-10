'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'motion/react';
import React, {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  path?: string; // Optional path for active state detection
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  activeIndex?: number;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  isActive?: boolean;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <div
      className={`relative inline-block ${isActive ? 'overflow-hidden rounded-lg' : ''}`}
    >
      {/* Star border effect for active items */}
      {isActive && (
        <>
          <div
            className="animate-star-movement-bottom absolute bottom-[-11px] right-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-70"
            style={{
              background: 'radial-gradient(circle, #60a5fa, transparent 10%)',
              animationDuration: '4s',
            }}
          />
          <div
            className="animate-star-movement-top absolute left-[-250%] top-[-10px] z-0 h-[50%] w-[300%] rounded-full opacity-70"
            style={{
              background: 'radial-gradient(circle, #60a5fa, transparent 10%)',
              animationDuration: '4s',
            }}
          />
        </>
      )}
      <motion.div
        ref={ref}
        style={{
          width: size,
          height: size,
        }}
        onHoverStart={() => isHovered.set(1)}
        onHoverEnd={() => isHovered.set(0)}
        onFocus={() => isHovered.set(1)}
        onBlur={() => isHovered.set(0)}
        onClick={onClick}
        className={`relative z-10 inline-flex items-center justify-center rounded-lg border-2 shadow-md transition-colors ${
          isActive
            ? 'border-blue-400 bg-gradient-to-br from-blue-900/50 to-purple-900/50'
            : 'border-neutral-700 bg-[#060010]'
        } ${className}`}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
      >
        {Children.map(children, child =>
          React.isValidElement(child)
            ? cloneElement(
                child as React.ReactElement<{
                  isHovered?: MotionValue<number>;
                }>,
                { isHovered }
              )
            : child
        )}
      </motion.div>
    </div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;

    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = '' }: DockIconProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50,
  activeIndex,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height, scrollbarWidth: 'none' }}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 mx-2 flex max-w-full items-center"
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} bg-black/ pointer-events-auto absolute bottom-2 left-1/2 flex w-fit -translate-x-1/2 transform items-end gap-4 rounded-2xl border-2 border-neutral-700 px-4 pb-2 backdrop-blur-md`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            isActive={activeIndex !== undefined && activeIndex === index}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
