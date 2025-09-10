import { useColorMode } from "@kobalte/core";
import Moon from "lucide-solid/icons/moon";
import Sun from "lucide-solid/icons/sun";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { toggleColorMode } = useColorMode();

  return (
    <Button
      size="sm"
      class="w-9 px-0"
      onClick={() => {
        toggleColorMode();
      }}
    >
      <Sun class="dark:-rotate-90 size-6 rotate-0 scale-0 transition-all dark:scale-100" />
      <Moon class="dark:-rotate-90 absolute size-6 rotate-0 scale-100 transition-all dark:scale-0" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  );
}
