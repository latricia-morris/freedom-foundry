import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  // react-day-picker and lucide currently resolve different compatible React
  // type packages in this workspace; normalize the forwarded SVG props here.
  const iconProps = props as unknown as React.ComponentProps<typeof Loader2Icon>;
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...iconProps}
    />
  );
}

export { Spinner };
