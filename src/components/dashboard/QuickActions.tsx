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
      <Card className="vibrant-card glass-card border-0 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gradient-hero animate-gradient">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className={`flex flex-col items-center gap-3 h-auto py-6 px-4 rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in ${
                index === 0 
                  ? 'bg-gradient-hero text-white border-0 hover:shadow-xl hover:shadow-primary/30' 
                  : 'bg-gradient-to-br from-card to-muted/50 hover:from-accent/20 hover:to-primary/10 border border-border/50 hover:border-primary/30 text-card-foreground'
              }`}
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <action.icon className="h-6 w-6 group-hover:rotate-6 transition-transform duration-300" />
              <span className="text-sm font-medium text-center leading-tight">{action.label}</span>
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