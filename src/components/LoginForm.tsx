
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const fillDemoAccount = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@yardpack.com');
      setPassword('admin123');
    } else {
      setEmail('customer@example.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to YardPack</CardTitle>
          <p className="text-gray-600">Sign in to track your packages</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Demo Accounts Available:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoAccount('admin')}
                    className="w-full text-left justify-start border-blue-300 text-blue-700"
                  >
                    <strong>Admin:</strong> admin@yardpack.com / admin123
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoAccount('customer')}
                    className="w-full text-left justify-start border-blue-300 text-blue-700"
                  >
                    <strong>Customer:</strong> customer@example.com / customer123
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500">
              <p>Click the buttons above to auto-fill demo credentials</p>
              <p>Note: You'll need to create these accounts first by signing up</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
