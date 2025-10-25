"use client";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import React from 'react';

const heartPathVariant: Variants = {
  initial: {
    pathLength: 1,
    opacity: 1,
  },
  hover: {
    pathLength: 1,
    opacity: 1,
  },
};


const handshakePathVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  hover: (custom: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: custom * 0.2, duration: 0.5, ease: "easeInOut" },
      opacity: { delay: custom * 0.2, duration: 0.01 },
    },
  }),
};

interface HeartHandshakeProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const HeartHandshake = ({
  width = 24,
  height = 24,
  strokeWidth = 2,
  ...props
}: HeartHandshakeProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      whileHover="hover"
      {...props}
    >
      <motion.path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        variants={heartPathVariant}
      />
      <motion.path
        d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"
        variants={handshakePathVariants}
        custom={1}
      />
      <motion.path
        d="m18 15-2-2"
        variants={handshakePathVariants}
        custom={2}
      />
      <motion.path
        d="m15 18-2-2"
        variants={handshakePathVariants}
        custom={3}
      />
    </motion.svg>
  );
};

export { HeartHandshake };
