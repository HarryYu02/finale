import { A, useNavigate } from "@solidjs/router";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import LogOut from "lucide-solid/icons/log-out";
import Settings from "lucide-solid/icons/settings";
import { type Component, For } from "solid-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient, type User } from "@/lib/auth-client";
import { ModeToggle } from "./ModeToggle";
import { showToast } from "./ui/toast";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Accounts",
    url: "/accounts",
  },
  {
    title: "Transactions",
    url: "/transactions",
  },
  {
    title: "Investments",
    url: "/investments",
  },
];

export const AppSidebar: Component<{
  user?: User;
}> = (props) => {
  const navigate = useNavigate();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader class="h-16 border-sidebar-border border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  as={SidebarMenuButton}
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={props.user?.image ?? ""}
                      alt={props.user?.name ?? ""}
                    />
                    <AvatarFallback class="rounded-lg">
                      {props.user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-medium">{props.user?.name}</span>
                    <span class="truncate text-xs">{props.user?.email}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
                  <DropdownMenuLabel class="p-0 font-normal">
                    <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar class="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={props.user?.image ?? ""}
                          alt={props.user?.name ?? ""}
                        />
                        <AvatarFallback class="rounded-lg">
                          {props.user?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div class="grid flex-1 text-left text-sm leading-tight">
                        <span class="truncate font-medium">
                          {props.user?.name}
                        </span>
                        <span class="truncate text-xs">
                          {props.user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      const result = await authClient.signOut();
                      if (result.error) {
                        showToast({
                          title: "Log out failed",
                          description: result.error.message,
                          variant: "error",
                        });
                      } else {
                        navigate("/login");
                      }
                    }}
                  >
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <For each={items}>
                  {(item) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton as={A} href={item.url}>
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </For>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup class="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton as={A} href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ModeToggle />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};
