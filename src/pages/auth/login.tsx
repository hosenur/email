import { Label } from "@/components/ui/field";
import { Input, InputGroup } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

const loginSchema = z.object({
  handle: z.string().min(1, "Handle is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      handle: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const email = `${value.handle}@rahaman.email`;
      await authClient.signIn.email({
        email,
        password: value.password,
      });
    //   navigate({ to: "/" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg p-8 space-y-6">
          {/* Header */}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            {/* Handle Field */}
            <form.Field
              name="handle"
              children={(field) => (
                <TextField>
                  <Label>Email Address</Label>
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder="handle"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.state.isSubmitting}
                    />
                    <Text>@rahaman.email</Text>
                  </InputGroup>
                </TextField>
              )}
            />

            {/* Password Field */}
            <form.Field
              name="password"
              children={(field) => (
                <TextField>
                  <Label>Password</Label>
                  <InputGroup>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.state.isSubmitting}
                    />
                  </InputGroup>
                </TextField>
              )}
            />

            {/* Sign In Button */}
            <Button
              type="submit"
              intent="primary"
              size="md"
              className="w-full"
              isDisabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-fg">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
