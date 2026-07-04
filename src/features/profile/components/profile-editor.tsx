"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, KeyRound, User } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateProfile, uploadAvatar, changePassword } from "../actions/profile.actions";

interface Props {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
  };
}

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().max(30).optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProfileEditor({ user }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPending, setAvatarPending] = useState(false);
  const [profilePending, startProfile] = useTransition();
  const [passwordPending, startPassword] = useTransition();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName, phone: user.phone ?? "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirm: "" },
  });

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    setAvatarPending(true);
    const res = await uploadAvatar(fd);
    setAvatarPending(false);
    if (res.success) {
      toast.success("Avatar updated");
      router.refresh();
    } else {
      toast.error(res.error ?? "Upload failed");
    }
  }

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    startProfile(async () => {
      const res = await updateProfile({ fullName: values.fullName, phone: values.phone || null });
      if (res.success) {
        toast.success("Profile updated");
        router.refresh();
      } else {
        toast.error(res.error ?? "Update failed");
      }
    });
  }

  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    startPassword(async () => {
      const res = await changePassword({ newPassword: values.newPassword });
      if (res.success) {
        toast.success("Password changed");
        passwordForm.reset();
      } else {
        toast.error(res.error ?? "Failed to change password");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Avatar + info card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl ?? ""} />
              <AvatarFallback className="text-2xl">{initials(user.fullName)}</AvatarFallback>
            </Avatar>
            <button
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => fileRef.current?.click()}
              disabled={avatarPending}
              aria-label="Upload avatar"
            >
              {avatarPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Upload className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {user.role.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Click avatar to upload a new photo</p>
        </CardContent>
      </Card>

      {/* Edit form */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input value={user.email} disabled />
                </FormItem>
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+971 50 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={profilePending}>
                    {profilePending ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Repeat the password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordPending}>
                    {passwordPending ? "Changing…" : "Change Password"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
