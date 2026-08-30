import type { TableHTMLAttributes, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export function Table({ className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="table-wrap">
      <table className={`table ${className}`} {...props} />
    </div>
  )
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}

export function TableFooter(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot {...props} />
}

export function TableRow({ className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...props} />
}

export function TableHead({ className = '', align, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { align?: 'right' | 'left' }) {
  return <th className={`${align === 'right' ? 'text-right' : ''} ${className}`} {...props} />
}

export function TableCell({ className = '', align, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { align?: 'right' | 'left' }) {
  return <td className={`${align === 'right' ? 'text-right' : ''} ${className}`} {...props} />
}
