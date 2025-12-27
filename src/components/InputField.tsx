import { ReactNode, InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export default function InputField({ label, icon, ...props }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          {...props}
          className={`w-full bg-white/5 border-gray-600 text-foreground placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/50 transition-all duration-180 ${
            icon ? 'pl-10' : ''
          }`}
        />
      </div>
    </div>
  );
}
