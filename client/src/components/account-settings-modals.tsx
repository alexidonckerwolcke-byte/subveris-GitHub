import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface AccountSettingsModalsProps {
  currentEmail: string;
}

export function AccountSettingsModals({
  currentEmail,
}: AccountSettingsModalsProps) {
  const { toast } = useToast();

  // Email change state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 2FA state
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Delete account state
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    setEmailLoading(true);
    try {
      const response = await fetch("/api/account/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) throw new Error("Failed to change email");

      toast({
        title: "Email changed",
        description: "Your email address has been updated successfully.",
      });
      setEmailModalOpen(false);
      setNewEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change email address",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setTwoFALoading(true);
    try {
      const response = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFACode }),
      });

      if (!response.ok) throw new Error("Failed to enable 2FA");

      toast({
        title: "2FA enabled",
        description:
          "Two-factor authentication has been enabled on your account.",
      });
      setTwoFAModalOpen(false);
      setTwoFACode("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/account/export", {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subveris-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete account");

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      // Redirect to home after account deletion
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Change Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address. We'll send a confirmation link to verify the change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={currentEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                data-testid="input-new-email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailModalOpen(false)}
              disabled={emailLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeEmail}
              disabled={emailLoading}
              data-testid="button-confirm-email-change"
            >
              {emailLoading ? "Updating..." : "Update Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and then your new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordModalOpen(false)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              data-testid="button-confirm-password-change"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable 2FA Modal */}
      <Dialog open={twoFAModalOpen} onOpenChange={setTwoFAModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the 6-digit code below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">
                QR Code would appear here
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="2fa-code">Authentication Code</Label>
              <Input
                id="2fa-code"
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                data-testid="input-2fa-code"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTwoFAModalOpen(false)}
              disabled={twoFALoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnable2FA}
              disabled={twoFALoading}
              data-testid="button-confirm-2fa"
            >
              {twoFALoading ? "Enabling..." : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data, including subscriptions and insights, will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete-account"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Button Handler */}
      <button
        onClick={handleExportData}
        style={{ display: "none" }}
        data-testid="export-data-handler"
      />

      {/* Modal Triggers - Export for external use */}
      <button
        onClick={() => setEmailModalOpen(true)}
        style={{ display: "none" }}
        data-testid="open-email-modal"
      />
      <button
        onClick={() => setPasswordModalOpen(true)}
        style={{ display: "none" }}
        data-testid="open-password-modal"
      />
      <button
        onClick={() => setTwoFAModalOpen(true)}
        style={{ display: "none" }}
        data-testid="open-2fa-modal"
      />
      <button
        onClick={() => setDeleteAlertOpen(true)}
        style={{ display: "none" }}
        data-testid="open-delete-alert"
      />
    </>
  );
}

// Export hook to use these modals from parent component
export function useAccountSettingsModals() {
  const emailTrigger = document.querySelector("[data-testid='open-email-modal']") as HTMLButtonElement;
  const passwordTrigger = document.querySelector("[data-testid='open-password-modal']") as HTMLButtonElement;
  const twoFATrigger = document.querySelector("[data-testid='open-2fa-modal']") as HTMLButtonElement;
  const deleteAccountTrigger = document.querySelector("[data-testid='open-delete-alert']") as HTMLButtonElement;
  const exportTrigger = document.querySelector("[data-testid='export-data-handler']") as HTMLButtonElement;

  return {
    openEmailModal: () => emailTrigger?.click(),
    openPasswordModal: () => passwordTrigger?.click(),
    openTwoFAModal: () => twoFATrigger?.click(),
    openDeleteAccount: () => deleteAccountTrigger?.click(),
    exportData: () => exportTrigger?.click(),
  };
}
