import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    ...renderOptions
  }: {
    preloadedState?: any;
  } & Omit<RenderOptions, 'wrapper'> = {}
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
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    email: 'test@example.com',
    full_name: 'Test User',
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  phone_number: '1234567890',
  role: 'customer' as const,
  address: '123 Test St',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  push_notifications_enabled: false,
  notification_preferences: {},
  push_token: null,
};

export const mockPackage = {
  id: 'test-package-id',
  tracking_number: 'TEST123',
  description: 'Test Package',
  status: 'received' as const,
  customer_id: 'test-customer-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  date_received: new Date().toISOString(),
  delivery_address: '123 Test St',
  estimated_delivery: null,
  actual_delivery: null,
  sender_name: 'Test Sender',
  sender_address: '456 Sender St',
  carrier: 'USPS',
  weight: 2.5,
  dimensions: '12x8x4',
  package_value: 100,
  duty_amount: 15,
  duty_rate: 0.15,
  total_due: 115,
  notes: 'Test notes',
  external_tracking_number: 'EXT123',
  api_sync_status: 'pending',
  last_api_sync: null,
  magaya_shipment_id: null,
  magaya_reference_number: null,
  warehouse_location: 'A1',
  consolidation_status: 'pending',
  delivery_estimate: null,
  last_notification_sent_at: null,
  last_notification_status: null,
};

export const mockCustomer = {
  id: 'test-customer-id',
  customer_number: 'CUST-2024-000001',
  full_name: 'Test Customer',
  email: 'customer@example.com',
  phone_number: '1234567890',
  address: '123 Customer St',
  customer_type: 'registered' as const,
  user_id: 'test-user-id',
  preferred_contact_method: 'email',
  notes: 'Test customer notes',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Wait for async operations to complete
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Re-export screen from render function
export const screen = {
  getByText: (text: string) => global.document.querySelector(`*:contains("${text}")`),
  getByDisplayValue: (value: string) => global.document.querySelector(`input[value="${value}"], select[value="${value}"]`),
  getByTestId: (testId: string) => global.document.querySelector(`[data-testid="${testId}"]`),
};