import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Layout from "@/components/Layout";
import UserManagement from "@/pages/UserManagement";
import BookingRequests from "@/pages/BookingRequests";
import DriverAllocation from "@/pages/DriverAllocation";
import HealthCheck from "@/pages/HealthCheck";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    const excludedPaths = ["/login", "/health"];
    if (!isAuthenticated && !excludedPaths.includes(location)) {
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/health" component={HealthCheck} />
      
      <Route path="/">
        {isAuthenticated ? (
          <Layout>
            <UserManagement />
          </Layout>
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/users">
        {isAuthenticated ? (
          <Layout>
            <UserManagement />
          </Layout>
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/bookings">
        {isAuthenticated ? (
          <Layout>
            <BookingRequests />
          </Layout>
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/allocation">
        {isAuthenticated ? (
          <Layout>
            <DriverAllocation />
          </Layout>
        ) : (
          <Login />
        )}
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
