import * as React from 'react';

import { cn } from '@/lib/utils';

type Size = 'default' | 'sm';

function Table({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'table'> & { size?: Size }) {
  return (
    <div
      data-slot='table-container'
      className={cn(
        size === 'sm' &&
          'relative w-full overflow-x-auto rounded-lg border border-gray-200'
      )}
    >
      <table
        data-slot='table'
        className={cn(
          size === 'sm' && 'w-full caption-bottom text-[10px]',
          className
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({
  className,
  size,
  ...props
}: React.ComponentProps<'thead'> & { size?: Size }) {
  return (
    <thead
      data-slot='table-header'
      className={cn(size === 'sm' && '[&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableBody({
  className,
  size,
  ...props
}: React.ComponentProps<'tbody'> & { size?: Size }) {
  return (
    <tbody
      data-slot='table-body'
      className={cn(size === 'sm' && '[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({
  className,
  size,
  ...props
}: React.ComponentProps<'tfoot'> & { size?: Size }) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn(
        size === 'sm' &&
          'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

function TableRow({
  className,
  size,
  ...props
}: React.ComponentProps<'tr'> & { size?: Size }) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        size === 'sm' &&
          'data-[state=selected]:bg-muted h-[24px] border-b border-gray-200 transition-none hover:bg-gray-50',
        className
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  size,
  ...props
}: React.ComponentProps<'th'> & { size?: Size }) {
  return (
    <th
      data-slot='table-head'
      className={cn(
        size === 'sm' &&
          'text-foreground h-7 border-r border-gray-200 px-2 text-left align-middle font-bold whitespace-nowrap last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  size,
  ...props
}: React.ComponentProps<'td'> & { size?: Size }) {
  return (
    <td
      data-slot='table-cell'
      className={cn(
        size === 'sm' &&
          'border-r border-gray-200 px-2 align-middle font-medium whitespace-nowrap last:border-r-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  size,
  ...props
}: React.ComponentProps<'caption'> & { size?: Size }) {
  return (
    <caption
      data-slot='table-caption'
      className={cn(
        size === 'sm' && 'text-muted-foreground mt-4 text-sm',
        className
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
