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

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    handle: z.string().min(1, "Handle is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      handle: "",
      password: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: registerSchema,
    },
    onSubmit: async ({ value }) => {
      const email = `${value.handle}@rahaman.email`;
      const name = `${value.firstName} ${value.lastName}`.trim();

      await authClient.signUp.email({
        email,
        password: value.password,
        name,
      });

      navigate({ to: "/" });
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
            {/* First Name Field */}
            <form.Field
              name="firstName"
              children={(field) => (
                <TextField>
                  <Label>First Name</Label>
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder="John"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.state.isSubmitting}
                    />
                  </InputGroup>
                </TextField>
              )}
            />

            {/* Last Name Field */}
            <form.Field
              name="lastName"
              children={(field) => (
                <TextField>
                  <Label>Last Name</Label>
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.state.isSubmitting}
                    />
                  </InputGroup>
                </TextField>
              )}
            />

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

            {/* Confirm Password Field */}
            <form.Field
              name="confirmPassword"
              children={(field) => (
                <TextField>
                  <Label>Confirm Password</Label>
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

            {/* Sign Up Button */}
            <Button
              type="submit"
              intent="primary"
              size="md"
              className="w-full"
              isDisabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-fg">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
