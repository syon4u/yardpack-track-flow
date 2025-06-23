
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, phoneNumber);
    if (error) {
      setError(error.message || 'An error occurred during signup');
    } else {
      setSuccess('Account created successfully! Please check your email to verify your account.');
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      setPhoneNumber('');
    }
    setIsLoading(false);
  };

  const fillDemoAccount = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@yardpack.com');
      setPassword('admin123');
      setFullName('YardPack Admin');
      setPhoneNumber('+1-305-555-0100');
    } else {
      setEmail('customer@example.com');
      setPassword('customer123');
      setFullName('Demo Customer');
      setPhoneNumber('+1-876-555-0201');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <p className="text-gray-600">Join YardPack to track your packages</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium mb-2">Quick Demo Account Setup:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('admin')}
                  className="w-full text-left justify-start border-blue-300 text-blue-700"
                >
                  Fill Admin Account Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('customer')}
                  className="w-full text-left justify-start border-blue-300 text-blue-700"
                >
                  Fill Customer Account Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
