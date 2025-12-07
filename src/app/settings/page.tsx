"use client";

import { authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AtSign,
  ChevronDown,
  ChevronUp,
  Lock,
  Mail,
  Trash,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { data: session, refetch } = authClient.useSession();
  const [name, setName] = useState(session?.user.name);
  const [email, setEmail] = useState(session?.user.email);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleSaveName = async () => {
    if (name && name.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }
    try {
      await authClient.updateUser({
        name,
      });
      setEditingName(false);
      toast.success("Name updated successfully");
    } catch {
      toast.error("Failed to update name");
    }
  };

  const handleSaveEmail = async () => {
    await authClient.changeEmail(
      {
        newEmail: email || "",
      },
      {
        onSuccess: async () => {
          toast.success(
            "Email updated successfully. Please verify your new email address.",
          );
          setEditingEmail(false);
          await refetch();
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.status === 400
              ? "Invalid email address"
              : "Failed to update email",
          );
        },
      },
    );
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await authClient.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        revokeOtherSessions: logoutOtherDevices,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch {
      toast.error("Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    await authClient.deleteUser({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Account deleted successfully");
          window.location.href = "/";
        },
      },
    });
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Create FormData and upload file
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to upload avatar");
        return;
      }

      const { url } = await response.json();

      // Update user with the new avatar URL
      await authClient.updateUser(
        {
          image: url,
        },
        {
          onSuccess: () => {
            toast.success("Avatar updated successfully");
            refetch();
          },
          onError: () => {
            toast.error("Failed to update avatar");
          },
        },
      );
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">
        <span className="text-muted-foreground text-base">
          You are Logged in as
        </span>{" "}
        <span className="decoration-primary font-bold underline decoration-dashed underline-offset-4">
          {session?.user.name}
        </span>
      </h1>

      <div className="flex flex-col gap-8">
        <h2 className="text-lg font-bold">Account</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="email">Avatar</Label>
            <div className="flex flex-row gap-2">
              <Avatar
                className="group size-24 cursor-pointer transition-all duration-300"
                onClick={() => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      await handleUploadAvatar(file);
                    }
                  };
                  fileInput.click();
                }}
              >
                <span className="absolute flex h-full w-full items-center justify-center bg-black/50 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <Upload className="size-4" />
                  upload
                </span>
                <AvatarImage
                  src={session?.user.image || ""}
                  alt={session?.user.name}
                />
                <AvatarFallback>
                  {session?.user.image ? "User" : session?.user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex flex-row gap-2">
              <InputGroup>
                <InputGroupInput
                  id="name"
                  type="text"
                  placeholder={session?.user.name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editingName}
                />
                <InputGroupAddon>
                  <AtSign className="size-4" />
                </InputGroupAddon>
              </InputGroup>
              {editingName ? (
                <Button onClick={handleSaveName} className="w-24">
                  Save
                </Button>
              ) : (
                <Button onClick={() => setEditingName(true)} className="w-24">
                  Edit
                </Button>
              )}
            </div>
          </div>

          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex flex-row gap-2">
              <InputGroup>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder={session?.user.email}
                  disabled={!editingEmail}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <InputGroupAddon>
                  <Mail className="size-4" />
                </InputGroupAddon>
              </InputGroup>
              {editingEmail ? (
                <Button onClick={handleSaveEmail} className="w-24">
                  Save
                </Button>
              ) : (
                <Button onClick={() => setEditingEmail(true)} className="w-24">
                  Edit
                </Button>
              )}
            </div>
          </div>

          <Separator />
          <div className="flex flex-col gap-4">
            <Collapsible open={collapsed} onOpenChange={setCollapsed}>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {collapsed ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                    Change Password
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-2 flex flex-col gap-4 rounded-lg border p-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="current-password"
                        type="password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoFocus
                      />
                      <InputGroupAddon>
                        <Lock className="size-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="new-password"
                        type="password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <InputGroupAddon>
                        <Lock className="size-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <InputGroup>
                      <InputGroupInput
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <InputGroupAddon>
                        <Lock className="size-4" />
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <div className="flex flex-col items-end justify-end gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-row gap-2">
                      <Checkbox
                        id="logout-other-devices"
                        checked={logoutOtherDevices}
                        onCheckedChange={(checked) =>
                          setLogoutOtherDevices(
                            checked === "indeterminate" ? false : checked,
                          )
                        }
                        className="cursor-pointer"
                      />
                      <Label htmlFor="logout-other-devices">
                        Logout Other Devices
                      </Label>
                    </div>
                    <div className="flex flex-row gap-2">
                      <Button onClick={handleSavePassword} size="sm">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <Separator />
          <div className="flex flex-col gap-4">
            <Label htmlFor="delete-account">Delete Account</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="size-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </DialogDescription>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
