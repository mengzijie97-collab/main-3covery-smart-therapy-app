import { Bluetooth } from 'lucide-react';
import { motion } from 'framer-motion';

interface BluetoothIconProps {
  animate?: boolean;
}

export default function BluetoothIcon({ animate = false }: BluetoothIconProps) {
  return (
    <div className="flex justify-center">
      <motion.div
        animate={animate ? {
          scale: [1, 1.05, 1],
          opacity: [1, 0.7, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40"
      >
        <Bluetooth className="w-12 h-12 text-primary" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}
