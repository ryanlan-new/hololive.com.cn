import { motion } from "framer-motion";

export default function Button({ children, className = "", ...rest }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={
        "bg-[var(--color-brand-blue)] text-white font-bold rounded px-5 py-2 shadow-lg hover:scale-105 transition-transform active:scale-95 focus:ring-2 focus:ring-brand-blue focus:outline-none " +
        className
      }
      {...rest}
    >
      {children}
    </motion.button>
  );
}
