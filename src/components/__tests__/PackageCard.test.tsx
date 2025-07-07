import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import PackageCard from '@/components/PackageCard';

const mockPackage = {
  id: 'test-package-id',
  trackingNumber: 'TEST123',
  description: 'Test Package Description',
  status: 'received' as const,
  dateReceived: new Date().toISOString(),
  estimatedDelivery: undefined,
  invoiceUploaded: false,
  dutyAssessed: false,
  totalDue: undefined,
  customerName: 'Test Customer',
  magayaShipmentId: null,
  magayaReferenceNumber: null,
  warehouseLocation: null,
  consolidationStatus: null,
};

const mockProps = {
  package: mockPackage,
  userRole: 'customer' as const,
  onStatusUpdate: vi.fn(),
  onUploadInvoice: vi.fn(),
  onViewInvoice: vi.fn(),
  onViewDetails: vi.fn(),
};

describe('PackageCard', () => {
  it('renders package information correctly', () => {
    const { getByText } = renderWithProviders(<PackageCard {...mockProps} />);

    expect(getByText('TEST123')).toBeInTheDocument();
    expect(getByText('Test Package Description')).toBeInTheDocument();
    expect(getByText('Test Customer')).toBeInTheDocument();
  });

  it('displays received status badge', () => {
    const { getByText } = renderWithProviders(<PackageCard {...mockProps} />);

    expect(getByText('Received')).toBeInTheDocument();
  });

  it('calls onViewDetails when view details button is clicked', async () => {
    const user = userEvent.setup();
    const { getByText } = renderWithProviders(<PackageCard {...mockProps} />);

    const viewDetailsButton = getByText('Details');
    await user.click(viewDetailsButton);

    expect(mockProps.onViewDetails).toHaveBeenCalledWith('test-package-id');
  });

  it('shows invoice upload button when no invoice uploaded', () => {
    const adminProps = {
      ...mockProps,
      userRole: 'admin' as const,
    };
    const { getByText } = renderWithProviders(<PackageCard {...adminProps} />);

    expect(getByText('Upload Invoice')).toBeInTheDocument();
  });

  it('shows view invoice button when invoice is uploaded', () => {
    const propsWithInvoice = {
      ...mockProps,
      package: { ...mockPackage, invoiceUploaded: true },
    };

    const { getByText } = renderWithProviders(<PackageCard {...propsWithInvoice} />);

    expect(getByText('View Invoice')).toBeInTheDocument();
  });

  it('displays total due when available', () => {
    const propsWithTotal = {
      ...mockProps,
      package: { ...mockPackage, totalDue: 150.50 },
    };

    const { getByText } = renderWithProviders(<PackageCard {...propsWithTotal} />);

    expect(getByText('$150.50')).toBeInTheDocument();
  });

  it('handles admin role correctly', () => {
    const adminProps = {
      ...mockProps,
      userRole: 'admin' as const,
    };

    const { getByDisplayValue } = renderWithProviders(<PackageCard {...adminProps} />);

    // Admin should see status update dropdown
    expect(getByDisplayValue('received')).toBeInTheDocument();
  });
});