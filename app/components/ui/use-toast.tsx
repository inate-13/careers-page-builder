// components/ui/use-toast.tsx (MOCK implementation)
import * as React from 'react';

// Define the basic structure of a toast utility
type Toast = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

// Simple console-based mock for useToast
export function useToast() {
  const toast = React.useCallback((props: Toast) => {
    const icon = props.variant === 'destructive' ? '❌' : '✅';
    console.log(`${icon} TOAST: ${props.title}`);
    if (props.description) {
        console.log(`    DESC: ${props.description}`);
    }
  }, []);

  // Return a mock object compatible with the component code
  return {
    toast,
  };
}