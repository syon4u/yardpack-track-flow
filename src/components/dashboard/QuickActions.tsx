import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Scan, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreatePackageForm from '../CreatePackageForm';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [showCreatePackage, setShowCreatePackage] = useState(false);

  const actions = [
    {
      label: 'Create Package',
      icon: Plus,
      action: () => setShowCreatePackage(true),
      variant: 'default' as const,
    },
    {
      label: 'Package Scanner',
      icon: Scan,
      action: () => navigate('/warehouse'),
      variant: 'outline' as const,
    },
    {
      label: 'Manage Customers',
      icon: Users,
      action: () => navigate('/dashboard?tab=customers'),
      variant: 'outline' as const,
    },
    {
      label: 'System Settings',
      icon: Settings,
      action: () => navigate('/dashboard?tab=settings'),
      variant: 'outline' as const,
    },
  ];

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="flex flex-col items-center gap-2 h-auto py-6 hover-glow bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {showCreatePackage && (
        <CreatePackageForm onClose={() => setShowCreatePackage(false)} />
      )}
    </>
  );
};

export default QuickActions;