// src/components/PageTransition.jsx
import { motion } from "framer-motion";

const variants = {
  initial: { x: "100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 50, ease: [0.4, 0.0, 0.2, 1] } // faster in
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 50, ease: [0.4, 0.0, 0.2, 1] } // quick out
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
      style={{ willChange: "transform" }} // prevent jank
    >
      {children}
    </motion.div>
  );
}