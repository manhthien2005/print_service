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
import type { DockPosition } from '@/lib/stores/useDockPositionStore';

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
  position?: DockPosition;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  isActive?: boolean;
  position: DockPosition;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  mouseY,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
  position,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(
    position === 'bottom' ? mouseX : mouseY,
    val => {
      const rect = ref.current?.getBoundingClientRect() ?? {
        x: 0,
        y: 0,
        width: baseItemSize,
        height: baseItemSize,
      };
      // Calculate distance from mouse to center of item
      // Use actual rect dimensions for more accurate calculation
      if (position === 'bottom') {
        return val - rect.x - rect.width / 2;
      } else {
        return val - rect.y - rect.height / 2;
      }
    }
  );

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
  position: DockPosition;
};

function DockLabel({
  children,
  className = '',
  isHovered,
  position,
}: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;

    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  const getLabelClasses = () => {
    if (position === 'bottom') {
      return 'absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white';
    } else if (position === 'left') {
      return 'absolute left-full ml-2 top-1/2 w-fit whitespace-nowrap rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white';
    } else {
      return 'absolute right-full mr-2 top-1/2 w-fit whitespace-nowrap rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white';
    }
  };

  const getAnimationProps = () => {
    if (position === 'bottom') {
      return {
        initial: { opacity: 0, y: 0 },
        animate: { opacity: 1, y: -10 },
        exit: { opacity: 0, y: 0 },
      };
    } else if (position === 'left') {
      return {
        initial: { opacity: 0, x: -10, y: '-50%' },
        animate: { opacity: 1, x: 0, y: '-50%' },
        exit: { opacity: 0, x: -10, y: '-50%' },
      };
    } else {
      return {
        initial: { opacity: 0, x: 10, y: '-50%' },
        animate: { opacity: 1, x: 0, y: '-50%' },
        exit: { opacity: 0, x: 10, y: '-50%' },
      };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          {...getAnimationProps()}
          transition={{ duration: 0.2 }}
          className={`${className} ${getLabelClasses()}`}
          role="tooltip"
          style={
            position === 'bottom'
              ? { x: '-50%' }
              : {
                  // For left/right, use transform to center vertically
                  // y is already handled in animation props
                }
          }
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
  position = 'bottom',
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const maxSize = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const sizeRow = useTransform(isHovered, [0, 1], [panelHeight, maxSize]);
  useSpring(sizeRow, spring);

  // Reset motion values when position changes
  useEffect(() => {
    isHovered.set(0);
    mouseX.set(Infinity);
    mouseY.set(Infinity);
  }, [position, isHovered, mouseX, mouseY]);

  const handleMouseMove = (e: React.MouseEvent) => {
    isHovered.set(1);
    // Use clientX/clientY (viewport coordinates) to match getBoundingClientRect()
    // This ensures accurate hover calculation for all positions
    if (position === 'bottom') {
      mouseX.set(e.clientX);
    } else {
      mouseY.set(e.clientY);
    }
  };

  const handleMouseLeave = () => {
    isHovered.set(0);
    mouseX.set(Infinity);
    mouseY.set(Infinity);
  };

  // Bottom position (default) - horizontal layout
  if (position === 'bottom') {
    return (
      <motion.div
        key="dock-bottom"
        style={{ height: maxSize, scrollbarWidth: 'none' }}
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 mx-2 flex max-w-full items-center"
      >
        <motion.div
          key="dock-bar-bottom"
          layout
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`${className} bg-black/ pointer-events-auto absolute bottom-2 left-1/2 flex w-fit -translate-x-1/2 transform items-end gap-4 rounded-2xl border-2 border-neutral-700 px-4 pb-2 backdrop-blur-md`}
          style={{ height: panelHeight }}
          role="toolbar"
          aria-label="Application dock"
          initial={false}
        >
          {items.map((item, index) => (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              mouseY={mouseY}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              isActive={activeIndex !== undefined && activeIndex === index}
              position={position}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel position={position}>{item.label}</DockLabel>
            </DockItem>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // Left position - vertical layout
  if (position === 'left') {
    return (
      <motion.div
        key="dock-left"
        style={{ width: maxSize, scrollbarWidth: 'none' }}
        className="pointer-events-none fixed bottom-0 left-0 top-0 z-50 flex items-center justify-center"
      >
        <motion.div
          key="dock-bar-left"
          layout
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`${className} bg-black/ pointer-events-auto absolute left-2 top-1/2 flex h-fit -translate-y-1/2 transform flex-col items-start gap-4 rounded-2xl border-2 border-neutral-700 py-4 pl-2 pr-2 backdrop-blur-md`}
          style={{ width: panelHeight }}
          role="toolbar"
          aria-label="Application dock"
          initial={false}
        >
          {items.map((item, index) => (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              mouseY={mouseY}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              isActive={activeIndex !== undefined && activeIndex === index}
              position={position}
            >
              <DockIcon>{item.icon}</DockIcon>
              <DockLabel position={position}>{item.label}</DockLabel>
            </DockItem>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // Right position - vertical layout
  return (
    <motion.div
      key="dock-right"
      style={{ width: maxSize, scrollbarWidth: 'none' }}
      className="pointer-events-none fixed bottom-0 right-0 top-0 z-50 flex items-center justify-center"
    >
      <motion.div
        key="dock-bar-right"
        layout
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${className} bg-black/ pointer-events-auto absolute right-2 top-1/2 flex h-fit -translate-y-1/2 transform flex-col items-end gap-4 rounded-2xl border-2 border-neutral-700 py-4 pl-2 pr-2 backdrop-blur-md`}
        style={{ width: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
        initial={false}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            mouseY={mouseY}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            isActive={activeIndex !== undefined && activeIndex === index}
            position={position}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel position={position}>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
