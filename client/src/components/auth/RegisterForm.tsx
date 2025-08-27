
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Lock, UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onRegister: (userId: string, username: string) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const user = await response.json();
      onRegister(user.id, user.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-800 border-minecraft-dark-stone">
      <CardHeader>
        <CardTitle className="text-2xl font-gaming font-bold text-minecraft-green flex items-center justify-center">
          <UserPlus className="mr-2" />
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                placeholder="Choose a username"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white focus:border-minecraft-green"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded p-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-minecraft-green hover:bg-minecraft-dark-green text-white font-semibold"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-minecraft-gold hover:text-minecraft-green transition-colors"
            >
              Already have an account? Login here
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
