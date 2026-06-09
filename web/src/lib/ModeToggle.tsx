import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Swap, SwapOff, SwapOn } from "@/components/ui/swap"
import { useTheme } from "./ThemeProvider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Swap
      swapped={isDark}
      onSwappedChange={(swapped) => setTheme(swapped ? "dark" : "light")}
      animation="rotate"
      asChild
    >
      <Button variant="ghost" size="icon">
        <SwapOff>
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </SwapOff>
        <SwapOn>
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        </SwapOn>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </Swap>
  )
}