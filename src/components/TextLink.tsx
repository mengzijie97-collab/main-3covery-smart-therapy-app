import { ReactNode, AnchorHTMLAttributes } from 'react';

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export default function TextLink({ children, ...props }: TextLinkProps) {
  return (
    <a
      {...props}
      className="text-secondary hover:text-secondary/80 transition-colors duration-180 ease-in-out underline-offset-4 hover:underline cursor-pointer text-sm"
    >
      {children}
    </a>
  );
}
