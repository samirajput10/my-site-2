"use client";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import React from 'react';

const pathVariants: Variants = {
  initial: {
    translateX: 0,
  },
  hover: {
    translateX: [-4, 0],
    transition: {
      delay: 0.1,
      type: "spring",
      stiffness: 200,
      damping: 13,
    },
  },
};

interface UsersProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const Users = ({
  width = 20,
  height = 20,
  strokeWidth = 2,
  stroke = "currentColor",
  ...props
}: UsersProps) => {

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <motion.path
          d="M22 21v-2a4 4 0 0 0-3-3.87"
          variants={pathVariants}
        />
        <motion.path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          variants={pathVariants}
        />
      </svg>
    </motion.div>
  );
};

export { Users };
