import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a custom render function that includes providers
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { default as fireEvent } from '@testing-library/user-event';
export { customRender as render };

// Mock data generators
export const mockPackage = {
  id: 'test-package-id',
  tracking_number: 'TEST-123',
  description: 'Test package',
  status: 'received' as const,
  customer_id: 'test-customer-id',
  delivery_address: 'Test Address',
  date_received: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  invoice_uploaded: false,
  duty_assessed: false,
  invoices: [],
};

export const mockCustomer = {
  id: 'test-customer-id',
  full_name: 'Test Customer',
  email: 'test@example.com',
  customer_type: 'registered' as const,
  customer_number: 'CUST-2024-001',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'customer' as const,
};