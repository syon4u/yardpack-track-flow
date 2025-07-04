
import React, { useState } from 'react';
import { useCreateUser } from '@/hooks/useCreateUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle } from 'lucide-react';

interface CreateUserFormProps {
  onClose: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const createUserMutation = useCreateUser();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'customer' as 'admin' | 'warehouse' | 'customer',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUserMutation.mutateAsync(formData);
      
      toast({
        title: "Success",
        description: `System user ${formData.full_name} created successfully`,
      });

      onClose();
    } catch (error: any) {
      console.error('User creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create system user",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? 'text-lg' : ''}>Create New System User</DialogTitle>
          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">System User Account</p>
              <p>This creates an account for staff members who will operate the YardPack system. For package recipients, use Customer Management instead.</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={`space-y-4 ${isMobile ? 'px-1' : ''}`}>
          <div>
            <Label htmlFor="full_name" className={isMobile ? 'text-sm' : ''}>Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter staff member's full name"
              required
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="email" className={isMobile ? 'text-sm' : ''}>Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter work email address"
              required
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="role" className={isMobile ? 'text-sm' : ''}>System Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger className={isMobile ? 'h-12 text-base' : ''}>
                <SelectValue placeholder="Select system role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer Service</SelectItem>
                <SelectItem value="warehouse">Warehouse Staff</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Determines system access and permissions
            </p>
          </div>

          <div>
            <Label htmlFor="username" className={isMobile ? 'text-sm' : ''}>Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username (optional)"
              className={isMobile ? 'h-12 text-base' : ''}
            />
          </div>

          <div>
            <Label htmlFor="password" className={isMobile ? 'text-sm' : ''}>Temporary Password *</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter temporary password"
                required
                minLength={6}
                className={isMobile ? 'h-12 text-base' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                className={isMobile ? 'h-12 px-3' : ''}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              User will be able to change this password after first login
            </p>
          </div>

          <div className={`flex gap-3 pt-4 ${isMobile ? 'flex-col' : ''}`}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={isMobile ? 'w-full h-12' : ''}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className={isMobile ? 'w-full h-12' : ''}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create System User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserForm;
