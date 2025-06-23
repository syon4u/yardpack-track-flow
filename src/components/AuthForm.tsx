
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {isLogin ? <LoginForm /> : <SignupForm />}
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          variant="ghost"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:text-blue-700"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;
