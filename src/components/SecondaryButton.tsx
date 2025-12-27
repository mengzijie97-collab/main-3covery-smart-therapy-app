import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function SecondaryButton({ 
  children, 
  fullWidth = false, 
  ...props 
}: SecondaryButtonProps) {
  return (
    <Button
      {...props}
      variant="outline"
      className={`bg-white/5 text-foreground border-gray-600 hover:bg-white/10 hover:border-secondary/50 transition-all duration-180 ease-in-out font-normal text-base h-12 rounded-lg ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </Button>
  );
}
