
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "./ThemeProvider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}






// "use client";


// import { Sun, MoonStar } from "lucide-react";
// import { useTheme } from "./ThemeProvider";
// import { Button } from "@/components/ui/button";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
//   TooltipProvider
// } from "@/components/ui/tooltip";

// export function ModeToggle() {
//   const { setTheme, theme } = useTheme();

//   return (
//     <TooltipProvider disableHoverableContent>
//       <Tooltip delayDuration={100}>
//         <TooltipTrigger asChild>
//           <Button
//             className="rounded-full w-8 h-8 bg-background mr-2"
//             variant="outline"
//             size="icon"
//             onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
//           >
//             <Sun
//               className="w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100"
//             />
//             <MoonStar
//               className="absolute w-[1.2rem] h-[1.2rem] rotate-0 scale-1000 transition-transform ease-in-out duration-500 dark:-rotate-90 dark:scale-0"
//             />
//             <span className="sr-only">Switch Theme</span>
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent side="bottom">Switch Theme</TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// }

// export default ModeToggle;