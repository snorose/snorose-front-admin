import * as React from 'react';

import { cn } from '@/shared/lib';

function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('rounded-lg border', className)} {...props} />;
}

Card.Header = function CardHeader({
  className,
  ...props
}: React.ComponentProps<'header'>) {
  return (
    <header className={cn('flex flex-col gap-1.5', className)} {...props} />
  );
};

Card.Title = function CardTitle({
  className,
  ...props
}: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
};

Card.Description = function CardDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)} {...props} />
  );
};

Card.Content = function CardContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('px-6 py-4', className)} {...props} />;
};

Card.Footer = function CardFooter({
  className,
  ...props
}: React.ComponentProps<'footer'>) {
  return <footer className={cn('flex items-center', className)} {...props} />;
};

export { Card };
