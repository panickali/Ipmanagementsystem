import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";

const AppHeader = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "My IP Assets", path: "/assets" },
    { name: "Register IP", path: "/register" },
    { name: "Transfers", path: "/transfers" },
    { name: "Licenses", path: "/licenses" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-white font-medium text-xl cursor-pointer">IP Chain</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.name} href={item.path}>
                    <a
                      className={`${
                        isActive(item.path)
                          ? "bg-primary-dark"
                          : "hover:bg-primary-light"
                      } text-white px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary-light focus:outline-none"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="max-w-xs rounded-full flex items-center text-sm focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                        {user?.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-primary-light focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <a
                  className={`${
                    isActive(item.path)
                      ? "bg-primary-dark"
                      : "hover:bg-primary-light"
                  } text-white block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-primary-dark">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white">
                  {user?.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {user?.name}
                </div>
                <div className="text-sm font-medium text-gray-300">
                  {user?.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-white hover:bg-primary-light focus:outline-none"
              >
                <Bell className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Button
                variant="ghost"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-light"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
