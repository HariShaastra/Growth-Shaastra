import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20',
    secondary: 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white',
    outline: 'border-2 border-stone-800 text-stone-400 hover:border-amber-600 hover:text-amber-500',
    ghost: 'text-stone-500 hover:text-white hover:bg-stone-800/50',
  };

  const sizes = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-4',
    lg: 'px-12 py-6 text-xl',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-[2.5rem] font-display font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
      ) : null}
      {children as React.ReactNode}
    </motion.button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={cn('bg-stone-900/60 rounded-[3rem] border border-stone-800 p-8 shadow-2xl transition-all', className)}
  >
    {children}
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; subtitle?: string }> = ({ children, subtitle }) => (
  <div className="mb-12">
    <h2 className="text-4xl md:text-5xl font-display text-white tracking-tighter">{children}</h2>
    {subtitle && <p className="text-stone-400 mt-4 font-serif italic text-xl opacity-80 leading-relaxed">{subtitle}</p>}
  </div>
);
