import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FormCardProps {
  children: ReactNode;
}

export default function FormCard({ children }: FormCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10"
    >
      {children}
    </motion.div>
  );
}
