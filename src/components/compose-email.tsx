"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { FileTrigger } from "@/components/ui/file-trigger";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import useSWR from "swr";

interface UserResponse {
  user: {
    signature: string | null;
  };
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

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

interface Attachment {
  filename: string;
  content: string;
  contentType: string;
}

export function ComposeEmail({ isOpen, onOpenChange }: ComposeEmailProps) {
  const { data } = useSWR<UserResponse>("/api/users", fetcher);
  const signature = data?.user?.signature;
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );
      newAttachments.push({
        filename: file.name,
        content: base64,
        contentType: file.type || "application/octet-stream",
      });
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
            attachments,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to send email");
        }

        toast.success("Email sent successfully");
        onOpenChange(false);
        form.reset();
        setAttachments([]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to send email",
        );
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (isOpen && signature && signature.trim()) {
      form.setFieldValue("body", `\n\n--\n${signature}`);
    } else if (isOpen) {
      form.setFieldValue("body", "");
    }
  }, [isOpen, signature, form]);

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent side="bottom" className="sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Compose Email</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileTrigger allowsMultiple onSelect={handleFileSelect}>
                  Attach files
                </FileTrigger>
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={attachment.filename}
                      className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                    >
                      <span className="max-w-[150px] truncate">
                        {attachment.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-muted-fg hover:text-fg"
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </DrawerBody>
        <DrawerFooter>
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
