
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCreatePackage } from '@/hooks/usePackages';
import { useToast } from '@/hooks/use-toast';

interface TestControlsCardProps {
  onTestPackageCreated: (trackingNumber: string) => void;
}

const TestControlsCard: React.FC<TestControlsCardProps> = ({ onTestPackageCreated }) => {
  const [showTestControls, setShowTestControls] = useState(false);
  const createPackageMutation = useCreatePackage();
  const { toast } = useToast();

  const createTestPackage = async () => {
    try {
      // Get the first customer for testing
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .limit(1);

      if (customerError) throw customerError;
      if (!customers || customers.length === 0) {
        toast({
          title: "No Customers Found",
          description: "Please create a customer first before creating test packages",
          variant: "destructive",
        });
        return;
      }

      const testTrackingNumber = `TEST-${Date.now()}`;
      const testPackageData = {
        tracking_number: testTrackingNumber,
        customer_id: customers[0].id,
        description: 'Test Package for Scanning',
        delivery_address: customers[0].address || '123 Test Street, Miami, FL',
        sender_name: 'Test Sender',
        sender_address: '456 Sender Ave, New York, NY',
        weight: 2.5,
        package_value: 50.00,
        carrier: 'USPS',
        external_tracking_number: '9400109699938908123456',
        status: 'received' as const
      };

      await createPackageMutation.mutateAsync(testPackageData);
      
      toast({
        title: "Test Package Created",
        description: `Created test package with tracking number: ${testTrackingNumber}`,
      });

      onTestPackageCreated(testTrackingNumber);
      
    } catch (error) {
      console.error('Error creating test package:', error);
      toast({
        title: "Failed to Create Test Package",
        description: "There was an error creating the test package",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testing & Development
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestControls(!showTestControls)}
          >
            {showTestControls ? 'Hide' : 'Show'} Test Tools
          </Button>
        </CardTitle>
      </CardHeader>
      {showTestControls && (
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={createTestPackage}
              disabled={createPackageMutation.isPending}
              className="flex items-center gap-2"
            >
              {createPackageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Test Package
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Create a test package to verify scanning functionality. The tracking number will be automatically filled in the scanner below.
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default TestControlsCard;
