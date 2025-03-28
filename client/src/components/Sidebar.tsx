import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Calendar, 
  Car, 
  LogOut 
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

const SidebarLink = ({ href, icon, children, active }: SidebarLinkProps) => (
  <Link href={href}>
    <a className={cn(
      "flex items-center px-6 py-3 transition-colors",
      active 
        ? "text-primary font-medium" 
        : "text-neutral-400 hover:text-primary"
    )}>
      {icon}
      <span className="ml-3">{children}</span>
    </a>
  </Link>
);

export default function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sidebar bg-white shadow-md w-full md:w-64 md:min-h-screen">
      <div className="p-4 flex items-center border-b border-neutral-200">
        <div className="w-10 h-10 mr-2 bg-primary rounded-full flex items-center justify-center text-white font-bold">
          D
        </div>
        <h1 className="text-xl font-medium text-neutral-500">DVC SnapE</h1>
      </div>
      <nav className="py-4">
        <ul>
          <li>
            <SidebarLink 
              href="/users" 
              icon={<Users className="h-5 w-5" />}
              active={location === "/" || location === "/users"}
            >
              User Management
            </SidebarLink>
          </li>
          <li>
            <SidebarLink 
              href="/bookings" 
              icon={<Calendar className="h-5 w-5" />}
              active={location === "/bookings"}
            >
              Booking Requests
            </SidebarLink>
          </li>
          <li>
            <SidebarLink 
              href="/allocation" 
              icon={<Car className="h-5 w-5" />}
              active={location === "/allocation"}
            >
              Driver Allocation
            </SidebarLink>
          </li>
        </ul>
      </nav>
      <div className="mt-auto p-4 border-t border-neutral-200">
        <button 
          className="flex items-center text-neutral-400 hover:text-red-500 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}
