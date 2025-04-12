
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would authenticate against a backend
    if (email && password) {
      toast.success('Successfully logged in!');
      navigate('/');
    } else {
      toast.error('Please enter both email and password');
    }
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would create a new user on the backend
    if (email && password && username && name) {
      toast.success('Account created successfully! You can now log in.');
      setTab('login');
    } else {
      toast.error('Please fill out all fields');
    }
  };
  
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <Flag className="h-8 w-8 text-f1-red animate-race-flag" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-f1-red">Checkered</span> Picks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join the Formula One prediction game
          </p>
        </div>
        
        <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" className="p-0 h-auto text-xs" type="button">
                        Forgot Password?
                      </Button>
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-f1-red hover:bg-f1-red/90">
                    Login
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Enter your information to create a new account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-f1-red hover:bg-f1-red/90">
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
