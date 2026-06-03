// Header.tsx

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, } from "lucide-react";
import HeaderItems from "./HeaderItems";

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </Button>

        {/* Breadcrumb */}
        <nav className="flex">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/dashboard" className="text-muted-foreground">
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li>{location.pathname.split("/").pop()}</li>
          </ol>
        </nav>
      </div>

      {/* Group search, notifications, mode toggle, and user menu */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        {/* <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 w-[200px] lg:w-[300px]" />
        </div> */}

       <HeaderItems />
      </div>
    </header>
  );
};

export default Header;
