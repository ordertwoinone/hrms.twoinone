"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { requestPasswordResetAction } from "../actions/password";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "../schemas/auth.schema";

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    await requestPasswordResetAction(values);
    // Always show success (anti-enumeration).
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10">
          <MailCheck className="size-6 text-success" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">
              {form.getValues("email")}
            </span>
            , we’ve sent a password reset link.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.login}>Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.ae"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href={ROUTES.login} className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
