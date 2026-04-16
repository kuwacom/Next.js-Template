"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useAddUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/api/v1/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/v1/api";

type DialogMode = "create" | "edit";

type UserFormValues = {
  name: string;
  email: string;
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

const EMPTY_USER_FORM: UserFormValues = {
  name: "",
  email: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function UsersLoadingSkeleton({
  count = 6,
  loadingLabel,
}: {
  count?: number;
  loadingLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border bg-card p-4 animate-pulse"
          aria-hidden
        >
          <svg
            viewBox="0 0 360 120"
            width="100%"
            height="120"
            className="h-30 w-full"
          >
            <rect x="0" y="0" width="360" height="120" rx="8" fill="none" />
            <circle cx="36" cy="36" r="24" className="fill-muted" />
            <rect
              x="72"
              y="18"
              rx="6"
              width="220"
              height="14"
              className="fill-muted"
            />
            <rect
              x="72"
              y="40"
              rx="6"
              width="160"
              height="12"
              className="fill-muted"
            />
            <rect
              x="72"
              y="68"
              rx="8"
              width="80"
              height="28"
              className="fill-muted"
            />
            <rect
              x="160"
              y="68"
              rx="8"
              width="80"
              height="28"
              className="fill-muted"
            />
            <rect
              x="300"
              y="18"
              rx="6"
              width="40"
              height="12"
              className="fill-muted"
            />
          </svg>
          <div className="sr-only">{loadingLabel}</div>
        </div>
      ))}
    </div>
  );
}

function UsersErrorState({
  title,
  retryLabel,
  retryingLabel,
  reloadPageLabel,
  onRetry,
  isRetrying,
}: {
  title: string;
  retryLabel: string;
  retryingLabel: string;
  reloadPageLabel: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? retryingLabel : retryLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            {reloadPageLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersList({
  users,
  emailLabel,
  editLabel,
  deleteLabel,
  deletingLabel,
  emptyLabel,
  userIdLabel,
  onEdit,
  onDelete,
  deletingUserId,
  isBusy,
}: {
  users: User[];
  emailLabel: string;
  editLabel: string;
  deleteLabel: string;
  deletingLabel: string;
  emptyLabel: string;
  userIdLabel: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  deletingUserId: number | null;
  isBusy: boolean;
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        const isDeleting = deletingUserId === user.id;

        return (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>{user.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {userIdLabel}: {user.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {emailLabel}: {user.email}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onEdit(user)}
                  disabled={isBusy}
                >
                  {editLabel}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(user)}
                  disabled={isBusy}
                >
                  {isDeleting ? deletingLabel : deleteLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function UserFormDialog({
  mode,
  open,
  values,
  isSubmitting,
  nameLabel,
  emailLabel,
  cancelLabel,
  editTitle,
  createTitle,
  saveLabel,
  addLabel,
  savingLabel,
  onOpenChange,
  onValueChange,
  onSubmitAction,
}: {
  mode: DialogMode | null;
  open: boolean;
  values: UserFormValues;
  isSubmitting: boolean;
  nameLabel: string;
  emailLabel: string;
  cancelLabel: string;
  editTitle: string;
  createTitle: string;
  saveLabel: string;
  addLabel: string;
  savingLabel: string;
  onOpenChange: (open: boolean) => void;
  onValueChange: (key: keyof UserFormValues, value: string) => void;
  onSubmitAction: (formData: FormData) => void | Promise<void>;
}) {
  const title = mode === "edit" ? editTitle : createTitle;
  const submitLabel = mode === "edit" ? saveLabel : addLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="space-y-4" action={onSubmitAction}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">{nameLabel}</Label>
              <Input
                id="user-name"
                name="name"
                value={values.name}
                onChange={(event) => onValueChange("name", event.target.value)}
                disabled={isSubmitting}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">{emailLabel}</Label>
              <Input
                id="user-email"
                name="email"
                type="email"
                value={values.email}
                onChange={(event) => onValueChange("email", event.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? savingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SWRPage() {
  const t = useTranslations("swr");
  const { users, error, isLoading, isValidating, mutate } = useUsers();
  const { addUser, isMutating: isAddingUser } = useAddUser();
  const { updateUser, isMutating: isUpdatingUser } = useUpdateUser();
  const { deleteUser, isMutating: isDeletingUser } = useDeleteUser();

  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(EMPTY_USER_FORM);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const isDialogOpen = dialogMode !== null;
  const isSubmitting = isAddingUser || isUpdatingUser;
  const isBusy = isSubmitting || isDeletingUser;
  const isRefreshing = isValidating && !isLoading;

  function resetDialog() {
    setDialogMode(null);
    setEditingUserId(null);
    setFormValues(EMPTY_USER_FORM);
  }

  function handleDialogOpenChange(open: boolean) {
    if (open || isSubmitting) {
      return;
    }

    resetDialog();
  }

  function handleCreateClick() {
    setNotice(null);
    setDialogMode("create");
    setEditingUserId(null);
    setFormValues(EMPTY_USER_FORM);
  }

  function handleEditClick(user: User) {
    setNotice(null);
    setDialogMode("edit");
    setEditingUserId(user.id);
    setFormValues({
      name: user.name,
      email: user.email,
    });
  }

  function handleFormValueChange(key: keyof UserFormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleRefresh() {
    setNotice(null);

    try {
      await mutate();
    } catch (refreshError) {
      setNotice({
        tone: "error",
        message: getErrorMessage(refreshError, t("failedToLoadUsers")),
      });
    }
  }

  async function handleSubmit(formData: FormData) {
    const nextValues = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
    };

    if (!nextValues.name || !nextValues.email) {
      setNotice({
        tone: "error",
        message: t("nameAndEmailRequired"),
      });
      return;
    }

    setNotice(null);

    try {
      if (dialogMode === "create") {
        await addUser(nextValues);
        setNotice({
          tone: "success",
          message: t("userAdded"),
        });
      }

      if (dialogMode === "edit" && editingUserId !== null) {
        await updateUser({
          userId: String(editingUserId),
          user: nextValues,
        });
        setNotice({
          tone: "success",
          message: t("userUpdated"),
        });
      }

      resetDialog();
    } catch (submitError) {
      setNotice({
        tone: "error",
        message: getErrorMessage(
          submitError,
          dialogMode === "edit" ? t("updateFailed") : t("addFailed"),
        ),
      });
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(t("deleteConfirm", { name: user.name }));

    if (!confirmed) {
      return;
    }

    setNotice(null);
    setDeletingUserId(user.id);

    try {
      await deleteUser(String(user.id));
      setNotice({
        tone: "success",
        message: t("userDeleted"),
      });
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: getErrorMessage(deleteError, t("deleteFailed")),
      });
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{t("usersList")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? t("refreshing") : t("refresh")}
          </Button>
          <Button type="button" onClick={handleCreateClick} disabled={isBusy}>
            {t("addUser")}
          </Button>
        </div>
      </div>

      {notice ? (
        <div
          className={
            notice.tone === "error"
              ? "rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              : "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
          }
        >
          {notice.message}
        </div>
      ) : null}

      <section aria-busy={isLoading || isBusy}>
        {error ? (
          <UsersErrorState
            title={getErrorMessage(error, t("failedToLoadUsers"))}
            retryLabel={t("retry")}
            retryingLabel={t("refreshing")}
            reloadPageLabel={t("reloadPage")}
            onRetry={() => void handleRefresh()}
            isRetrying={isRefreshing}
          />
        ) : null}

        {!error && isLoading && users.length === 0 ? (
          <UsersLoadingSkeleton count={6} loadingLabel={t("loadingUserCard")} />
        ) : null}

        {!error && (!isLoading || users.length > 0) ? (
          <UsersList
            users={users}
            emailLabel={t("email")}
            editLabel={t("edit")}
            deleteLabel={t("delete")}
            deletingLabel={t("deleting")}
            emptyLabel={t("emptyUsers")}
            userIdLabel={t("userId")}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            deletingUserId={deletingUserId}
            isBusy={isBusy}
          />
        ) : null}
      </section>

      <UserFormDialog
        mode={dialogMode}
        open={isDialogOpen}
        values={formValues}
        isSubmitting={isSubmitting}
        nameLabel={t("name")}
        emailLabel={t("email")}
        cancelLabel={t("cancel")}
        editTitle={t("editUser")}
        createTitle={t("addUser")}
        saveLabel={t("save")}
        addLabel={t("add")}
        savingLabel={t("saving")}
        onOpenChange={handleDialogOpenChange}
        onValueChange={handleFormValueChange}
        onSubmitAction={handleSubmit}
      />
    </div>
  );
}
