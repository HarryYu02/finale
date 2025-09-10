import {
  createAsync,
  type RouteDefinition,
  useLocation,
} from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { assertSession } from "@/server";

export const route = {
  preload() {
    return assertSession("/");
  },
} satisfies RouteDefinition;

const ProtectedLayout: ParentComponent = (props) => {
  const session = createAsync(() => assertSession("/"), { deferStream: true });
  const location = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar user={session()?.user} />
      <SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2">
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator
              orientation="vertical"
              class="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem class="">
                  <BreadcrumbLink current>{location.pathname}</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">{props.children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
