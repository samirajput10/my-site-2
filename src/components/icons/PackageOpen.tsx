"use client";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import React from 'react';

const pathVariants: Variants = {
  initial: {
    pathLength: 1
  },
  hover: {
    pathLength: 0,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

const boxVariants: Variants = {
  initial: {
    pathLength: 0,
  },
  hover: {
    pathLength: 1,
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

interface PackageOpenProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const PackageOpen = ({
  width = 24,
  height = 24,
  strokeWidth = 2,
  stroke = "currentColor",
  ...props
}: PackageOpenProps) => {
  return (
    <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="initial"
        whileHover="hover"
        {...props}
      >
        <motion.path d="M12 22v-9" variants={pathVariants} />
        <motion.path
          d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z"
          variants={pathVariants}
        />
        <motion.path
          d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13"
          variants={pathVariants}
        />
        <motion.path
          d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z"
          variants={pathVariants}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="1"
          fill="currentColor"
          variants={boxVariants}
        />
      </motion.svg>
  );
};

export { PackageOpen };
