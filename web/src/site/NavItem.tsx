import { Link } from "react-router-dom"
import { useFrappeAuth } from "frappe-react-sdk"

import { NavUser } from "@/auth/nav-user"
import { Button } from "@/components/ui/button"

export function NavItems() {
  const { currentUser } = useFrappeAuth()

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">Log in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  return <NavUser />
}

export default NavItems