import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function PrimaryButton({ 
  children, 
  fullWidth = false, 
  ...props 
}: PrimaryButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-180 ease-in-out font-normal text-base h-12 rounded-lg ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </Button>
  );
}
