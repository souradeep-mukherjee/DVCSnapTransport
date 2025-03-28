import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiTestResult, setApiTestResult] = useState("");
  const { login } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Test direct API connection on load
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const endTime = Date.now();
        const data = await response.json();
        setApiTestResult(`API Direct Test: Status ${response.status}, Time ${endTime - startTime}ms, Token: ${data?.token ? 'Received' : 'Not received'}`);
      } catch (err: any) {
        setApiTestResult(`API Direct Test Error: ${err.message}`);
      }
    };
    
    testApiConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log("Logging in with:", username, password);

    try {
      // Use the existing auth function
      const success = await login(username, password);
      console.log("Login result:", success);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to DVC SnapE admin panel",
        });
        setLocation("/users");
      } else {
        setError("Invalid credentials. Please try again. Make sure you're using 'admin' as username and 'admin123' as password.");
        console.error("Login failed with credentials:", { username, password });
      }
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";
      if (err && err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-neutral-500">Admin Login</h2>
            <p className="text-neutral-400 mt-2">Sign in to access the DVC SnapE admin panel</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-neutral-500">
                Username
              </Label>
              <Input 
                id="username"
                type="text" 
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-500">
                Password
              </Label>
              <Input 
                id="password"
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            {apiTestResult && (
              <div className="text-xs mt-2 p-2 bg-gray-100 rounded">
                <div className="font-bold">Debug Info:</div>
                <div>{apiTestResult}</div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
