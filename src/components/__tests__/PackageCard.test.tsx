import { render, screen, fireEvent } from '@/test/utils';
import { vi } from 'vitest';
import PackageCard from '../PackageCard';
import { mockPackage } from '@/test/utils';

describe('PackageCard', () => {
  const mockProps = {
    package: {
      id: 'test-id',
      trackingNumber: 'TEST-123',
      description: 'Test package',
      status: 'received' as const,
      dateReceived: '2024-01-01T00:00:00Z',
      invoiceUploaded: false,
      dutyAssessed: false,
      customerName: 'Test Customer',
    },
    userRole: 'customer' as const,
    onStatusUpdate: vi.fn(),
    onUploadInvoice: vi.fn(),
    onViewInvoice: vi.fn(),
    onViewDetails: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders package information correctly', () => {
    render(<PackageCard {...mockProps} />);
    
    expect(screen.getByText('TEST-123')).toBeInTheDocument();
    expect(screen.getByText('Test package')).toBeInTheDocument();
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
  });

  it('shows correct status badge', () => {
    render(<PackageCard {...mockProps} />);
    
    expect(screen.getByText('Received')).toBeInTheDocument();
  });

  it('calls onViewDetails when view details button is clicked', () => {
    render(<PackageCard {...mockProps} />);
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(mockProps.onViewDetails).toHaveBeenCalledWith('test-id');
  });

  it('shows upload invoice button when invoice not uploaded', () => {
    render(<PackageCard {...mockProps} />);
    
    expect(screen.getByText('Upload Invoice')).toBeInTheDocument();
  });

  it('shows view invoice button when invoice is uploaded', () => {
    const propsWithInvoice = {
      ...mockProps,
      package: {
        ...mockProps.package,
        invoiceUploaded: true,
      },
    };
    
    render(<PackageCard {...propsWithInvoice} />);
    
    expect(screen.getByText('View Invoice')).toBeInTheDocument();
  });

  it('calls onUploadInvoice when upload button is clicked', () => {
    render(<PackageCard {...mockProps} />);
    
    const uploadButton = screen.getByText('Upload Invoice');
    fireEvent.click(uploadButton);
    
    expect(mockProps.onUploadInvoice).toHaveBeenCalledWith('test-id');
  });
});