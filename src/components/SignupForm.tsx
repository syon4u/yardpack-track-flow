
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
    <div className="min-h-screen flex bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Left Side - Brand Content (same as login) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-teal-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-teal-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="relative">
                <Package className="h-12 w-12 text-teal-400" />
              </div>
              <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
                YardPack
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Join Our Network<br />
              <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
                Start Shipping Today
              </span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Create your account and gain access to our premium shipping 
              platform with comprehensive tracking and secure handling.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center">
              <Package className="h-10 w-10 text-primary" />
              <span className="ml-3 text-2xl font-bold text-foreground">YardPack</span>
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
              <p className="text-muted-foreground">Join YardPack to start tracking your packages</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-foreground">Phone Number (Optional)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                
                {error && (
                  <div className="flex items-center space-x-2 text-destructive text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 text-success text-sm p-3 bg-success/10 rounded-md border border-success/20">
                    <CheckCircle className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-start space-x-3 p-4 bg-info/10 rounded-lg border border-info/20">
                  <div className="text-sm">
                    <p className="font-medium text-info-foreground mb-3">Quick Demo Setup:</p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoAccount('admin')}
                        className="w-full text-left justify-start h-auto p-3 bg-background/50 border-border/50 hover:bg-accent/50 hover:border-accent text-foreground"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Fill Admin Details</span>
                          <span className="text-xs text-muted-foreground">Pre-fill admin account info</span>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoAccount('customer')}
                        className="w-full text-left justify-start h-auto p-3 bg-background/50 border-border/50 hover:bg-accent/50 hover:border-accent text-foreground"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Fill Customer Details</span>
                          <span className="text-xs text-muted-foreground">Pre-fill customer account info</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
