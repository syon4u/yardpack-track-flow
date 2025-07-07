import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
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
    renderWithProviders(<PackageCard {...mockProps} />);

    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByText('Test Package Description')).toBeInTheDocument();
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
  });

  it('displays received status badge', () => {
    renderWithProviders(<PackageCard {...mockProps} />);

    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('calls onViewDetails when view details button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PackageCard {...mockProps} />);

    const viewDetailsButton = screen.getByText('View Details');
    await user.click(viewDetailsButton);

    expect(mockProps.onViewDetails).toHaveBeenCalledWith('test-package-id');
  });

  it('shows invoice upload button when no invoice uploaded', () => {
    renderWithProviders(<PackageCard {...mockProps} />);

    expect(screen.getByText('Upload Invoice')).toBeInTheDocument();
  });

  it('shows view invoice button when invoice is uploaded', () => {
    const propsWithInvoice = {
      ...mockProps,
      package: { ...mockPackage, invoiceUploaded: true },
    };

    renderWithProviders(<PackageCard {...propsWithInvoice} />);

    expect(screen.getByText('View Invoice')).toBeInTheDocument();
  });

  it('displays total due when available', () => {
    const propsWithTotal = {
      ...mockProps,
      package: { ...mockPackage, totalDue: 150.50 },
    };

    renderWithProviders(<PackageCard {...propsWithTotal} />);

    expect(screen.getByText('$150.50')).toBeInTheDocument();
  });

  it('handles admin role correctly', () => {
    const adminProps = {
      ...mockProps,
      userRole: 'admin' as const,
    };

    renderWithProviders(<PackageCard {...adminProps} />);

    // Admin should see additional controls
    expect(screen.getByText('Update Status')).toBeInTheDocument();
  });
});