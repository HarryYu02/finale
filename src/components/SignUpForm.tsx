import { useNavigate } from "@solidjs/router";
import GalleryVerticalEnd from "lucide-solid/icons/gallery-vertical-end";
import { type Component, type ComponentProps, splitProps } from "solid-js";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { showToast } from "./ui/toast";

export const SignUpForm: Component<ComponentProps<"div">> = (props) => {
  const [, rest] = splitProps(props, ["class"]);
  const navigate = useNavigate();

  return (
    <div class={cn("flex flex-col gap-6", props.class)} {...rest}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const email = formData.get("email");
          const password = formData.get("password");
          const name = formData.get("name");
          if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof name !== "string"
          ) {
            return new Error("Name, email and password are required");
          }
          const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/",
          });
          if (error) {
            showToast({
              title: "Sign up failed",
              description: error.message,
              variant: "error",
            });
          } else {
            showToast({
              title: "Sign up successfully",
              description: `Welcome, ${data.user.name}`,
              variant: "success",
            });
            form.reset();
            navigate("/");
          }
        }}
      >
        <div class="flex flex-col gap-6">
          <div class="flex flex-col items-center gap-2">
            <a href="/" class="flex flex-col items-center gap-2 font-medium">
              <div class="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd class="size-6" />
              </div>
              <span class="sr-only">Acme Inc.</span>
            </a>
            <h1 class="font-bold text-xl">Welcome to Acme Inc.</h1>
            <div class="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" class="underline underline-offset-4">
                Login
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-6">
            <div class="grid gap-3">
              <TextField class="grid w-full max-w-sm items-center gap-1.5">
                <TextFieldLabel for="name">Name</TextFieldLabel>
                <TextFieldInput
                  type="text"
                  name="name"
                  id="name"
                  placeholder="John Doe"
                  required
                />
              </TextField>
            </div>
            <div class="grid gap-3">
              <TextField class="grid w-full max-w-sm items-center gap-1.5">
                <TextFieldLabel for="email">Email</TextFieldLabel>
                <TextFieldInput
                  type="email"
                  name="email"
                  id="email"
                  placeholder="m@example.com"
                  required
                />
              </TextField>
            </div>
            <div class="grid gap-3">
              <TextField class="grid w-full max-w-sm items-center gap-1.5">
                <TextFieldLabel for="password">Password</TextFieldLabel>
                <TextFieldInput
                  type="password"
                  name="password"
                  id="password"
                  placeholder="********"
                  required
                />
              </TextField>
            </div>
            <Button type="submit" class="w-full">
              Sign up
            </Button>
          </div>
        </div>
      </form>
      <div class="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our <a href="/">Terms of Service</a>{" "}
        and <a href="/">Privacy Policy</a>.
      </div>
    </div>
  );
};
