import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Layout from "@/components/Layout";
import UserManagement from "@/pages/UserManagement";
import BookingRequests from "@/pages/BookingRequests";
import DriverAllocation from "@/pages/DriverAllocation";
import HealthCheck from "@/pages/HealthCheck";
import { useEffect, useState } from "react";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/health" component={HealthCheck} />
      
      <Route path="/">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/users">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/bookings">
        <ProtectedRoute>
          <BookingRequests />
        </ProtectedRoute>
      </Route>
      
      <Route path="/allocation">
        <ProtectedRoute>
          <DriverAllocation />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
