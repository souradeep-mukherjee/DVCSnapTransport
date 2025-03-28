import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log("Login attempt with:", username, password);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      console.log("Login response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Login success, token received");
        
        if (data.token) {
          // Save token and set authenticated state
          localStorage.setItem("adminToken", data.token);
          
          toast({
            title: "Login successful",
            description: "Welcome to DVC SnapE admin panel",
          });
          
          // Redirect to user management
          window.location.href = "/users";
          return;
        }
      } else {
        // Try to get the error message from the response
        let errorMsg = "Invalid credentials";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          // If we can't parse the JSON, use the default error message
        }
        
        setError(`Login failed: ${errorMsg}. Please try again with username 'admin' and password 'admin123'.`);
        console.error("Login failed. Status:", response.status);
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}. Please check your connection.`);
      console.error("Login network error:", err);
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
