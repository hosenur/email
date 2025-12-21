"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";

const composeSchema = z.object({
  to: z.string().min(1, "To address is required"),
  cc: z.string(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

interface ComposeEmailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComposeEmail({ isOpen, onOpenChange }: ComposeEmailProps) {
  const form = useForm({
    defaultValues: {
      to: "",
      cc: "",
      subject: "",
      body: "",
    },
    validators: {
      onDynamic: composeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const to = value.to
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean);
        const cc = value.cc
          ? value.cc
              .split(",")
              .map((email) => email.trim())
              .filter(Boolean)
          : [];

        const res = await fetch("/api/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            to,
            cc,
            subject: value.subject,
            body: value.body,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to send email");
        }

        toast.success("Email sent successfully");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to send email",
        );
        console.error(error);
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-2xl">
        <ModalHeader>
          <ModalTitle>Compose Email</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <form
            id="compose-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="to">
              {(field) => (
                <TextField className="w-full">
                  <Label>To</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="recipient@example.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-danger">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </TextField>
              )}
            </form.Field>

            <form.Field name="cc">
              {(field) => (
                <TextField className="w-full">
                  <Label>CC</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="cc@example.com (optional)"
                  />
                </TextField>
              )}
            </form.Field>

            <form.Field name="subject">
              {(field) => (
                <TextField className="w-full">
                  <Label>Subject</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Subject"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-danger">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </TextField>
              )}
            </form.Field>

            <form.Field name="body">
              {(field) => (
                <TextField className="w-full">
                  <Label>Message</Label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Write your message..."
                    className="min-h-[200px] resize-none"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-danger">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </TextField>
              )}
            </form.Field>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button intent="outline" onPress={() => onOpenChange(false)}>
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                form="compose-form"
                type="submit"
                isDisabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Email"}
              </Button>
            )}
          </form.Subscribe>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
