import { SignUpForm } from "@/components/SignUpForm";

export default function LoginPage() {
  return (
    <div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div class="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
