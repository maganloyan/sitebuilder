import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "@/utils/ModeToggle";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { cn } from "@/lib/utils";
import { NavItems } from "./NavItem";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
interface NavItem {
  label: string;
  url: string;
  parent_label?: string;
  description?: string;
}

interface GroupedNavItem {
  parent: NavItem;
  children: NavItem[];
}

interface GroupedNavItems {
  [key: string]: GroupedNavItem;
}

export function MainNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, error } = useFrappeGetDoc("Site Settings", "Site Settings");
  const [hasScrolled, setHasScrolled] = useState(false);

  // Don't render navbar on portal routes
  if (location.pathname.startsWith('/portal')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (url: string) => location.pathname === url;

  const links = data?.top_bar_items || [];
  const groupedLinks = links.reduce((acc, item) => {
    if (!item.parent_label && item.label) {
      acc[item.label] = { parent: item, children: [] };
    } else if (item.parent_label) {
      if (!acc[item.parent_label]) {
        acc[item.parent_label] = { parent: { label: item.parent_label }, children: [] };
      }
      acc[item.parent_label].children.push(item);
    }
    return acc;
  }, {});

  return (
    <header className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed w-full top-0 z-50 ${hasScrolled ? "shadow-lg" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
              {data?.app_logo && (
                <img src={data.app_logo} alt={data.app_name || ""} className="h-14 w-auto" />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavigationMenu className="relative z-50">
              <NavigationMenuList>
                {Object.entries(groupedLinks).map(([label, { parent, children }]) => (
                  <NavigationMenuItem key={label}>
                    {children.length > 0 ? (
                      <>
                        <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className={cn("grid gap-3 p-4 w-[200px] md:w-[400px]",
                            children.length > 3 ? "grid-cols-2" : "grid-cols-1"
                          )}>
                            {children.map((child) => (
                              <li key={child.label}>
                                <Link
                                  to={child.url}
                                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none whitespace-normal">{child.label}</div>
                                  {child.description && (
                                    <p className="line-clamp-2 mt-1 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link
                        to={parent.url}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "cursor-pointer",
                          isActive(parent.url) && "text-primary"
                        )}
                      >
                        {parent.label}
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          
          {/* Right side items */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-4">
          <ModeToggle />
          <NavItems />
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                  {Object.entries(groupedLinks).map(([label, { parent, children }]) => (
                    <React.Fragment key={label}>
                      {children.length > 0 ? (
                        <div className="space-y-2">
                          <div className="font-medium">{label}</div>
                          <div className="pl-4 space-y-2">
                            {children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.url}
                                className="block text-muted-foreground hover:text-primary"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          key={label}
                          to={parent.url}
                          className={cn(
                            "block hover:text-primary",
                            isActive(parent.url) && "text-primary font-medium"
                          )}
                        >
                          {parent.label}
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default MainNavbar;