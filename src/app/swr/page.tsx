"use client";

import { useState } from "react";
import {
  useAddUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/api/v1/users";
import { Badge } from "@/components/ui/badge";
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
import {
  ApiResultError,
  ErrorCode,
  isApiResultError,
} from "@/lib/apiError";
import { User } from "@/types/v1/api";

type DialogMode = "create" | "edit";

type UserFormValues = {
  name: string;
  email: string;
};

type Notice = {
  tone: "success" | "error";
  message: string;
  error?: unknown;
};

const EMPTY_USER_FORM: UserFormValues = {
  name: "",
  email: "",
};

/**
 * 表示用のエラーメッセージへ正規化する
 */
function getErrorMessage(error: unknown) {
  if (isApiResultError(error)) {
    switch (error.code) {
      case ErrorCode.VALIDATION_ERROR:
        return "入力内容を確認してください";
      case ErrorCode.UNAUTHORIZED:
        return "ログインが必要です";
      case ErrorCode.FORBIDDEN:
        return "操作する権限がありません";
      case ErrorCode.NOT_FOUND:
        return "対象のユーザーが見つかりません";
      default:
        return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "ユーザー情報の取得に失敗しました";
}

function getErrorTitle(error: unknown) {
  return isApiResultError(error) ? "API エラー" : "リクエストエラー";
}

function getApiErrorDetails(error: ApiResultError) {
  if (error.details === undefined) {
    return null;
  }

  if (typeof error.details === "string") {
    return error.details;
  }

  return JSON.stringify(error.details, null, 2);
}

/**
 * API の共通エラーと通信エラーを同じ見た目で扱う
 */
function ErrorSummary({
  error,
  message,
}: {
  error: unknown;
  message?: string;
}) {
  const apiError = isApiResultError(error) ? error : null;
  const details = apiError ? getApiErrorDetails(apiError) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={apiError ? "destructive" : "secondary"}>
          {getErrorTitle(error)}
        </Badge>
        {apiError ? (
          <>
            <Badge variant="outline">{apiError.code}</Badge>
            <Badge variant="outline">HTTP {apiError.status}</Badge>
          </>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">
        {message ?? getErrorMessage(error)}
      </p>
      {details ? (
        <pre className="max-h-40 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
          {details}
        </pre>
      ) : null}
    </div>
  );
}

/**
 * 初回ロード中に表示するユーザーカードのスケルトン
 */
function UsersLoadingSkeleton({ count = 6 }: { count?: number }) {
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
          <div className="sr-only">Loading user card</div>
        </div>
      ))}
    </div>
  );
}

/**
 * 一覧取得エラー時の再試行 UI
 */
function UsersErrorState({
  error,
  onRetry,
  isRetrying,
}: {
  error: unknown;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ユーザー一覧を読み込めませんでした</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorSummary error={error} />
        <div className="flex gap-2">
          <Button onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? "再取得中..." : "再試行"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            ページを再読み込み
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CRUD デモ用のユーザー一覧カード
 */
function UsersList({
  users,
  onEdit,
  onDelete,
  deletingUserId,
  isBusy,
}: {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  deletingUserId: number | null;
  isBusy: boolean;
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          ユーザーがまだ登録されていません
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
                  ID: {user.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onEdit(user)}
                  disabled={isBusy}
                >
                  編集
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(user)}
                  disabled={isBusy}
                >
                  {isDeleting ? "削除中..." : "削除"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * 追加と編集の両方に使うユーザーフォームダイアログ
 */
function UserFormDialog({
  mode,
  open,
  values,
  isSubmitting,
  onOpenChange,
  onValueChange,
  onSubmitAction,
}: {
  mode: DialogMode | null;
  open: boolean;
  values: UserFormValues;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (key: keyof UserFormValues, value: string) => void;
  onSubmitAction: (formData: FormData) => void | Promise<void>;
}) {
  const title = mode === "edit" ? "ユーザーを編集" : "ユーザーを追加";
  const submitLabel = mode === "edit" ? "保存" : "追加";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="space-y-4" action={onSubmitAction}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
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
              <Label htmlFor="user-email">Email</Label>
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
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SWRPage() {
  const { users, error, isLoading, isValidating, mutate } = useUsers();
  const {
    addUser,
    error: addUserError,
    isMutating: isAddingUser,
  } = useAddUser();
  const {
    updateUser,
    error: updateUserError,
    isMutating: isUpdatingUser,
  } = useUpdateUser();
  const {
    deleteUser,
    error: deleteUserError,
    isMutating: isDeletingUser,
  } = useDeleteUser();

  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(EMPTY_USER_FORM);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const isDialogOpen = dialogMode !== null;
  const isSubmitting = isAddingUser || isUpdatingUser;
  const isBusy = isSubmitting || isDeletingUser;
  const isRefreshing = isValidating && !isLoading;
  const mutationError = addUserError ?? updateUserError ?? deleteUserError;

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
        message: getErrorMessage(refreshError),
        error: refreshError,
      });
    }
  }

  /**
   * 追加と編集の送信を単一のフォームハンドラで処理する
   */
  async function handleSubmit(formData: FormData) {
    const nextValues = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
    };

    if (!nextValues.name || !nextValues.email) {
      setNotice({
        tone: "error",
        message: "名前とメールアドレスを入力してください",
      });
      return;
    }

    setNotice(null);

    try {
      if (dialogMode === "create") {
        await addUser(nextValues);
        setNotice({
          tone: "success",
          message: "ユーザーを追加しました",
        });
      }

      if (dialogMode === "edit" && editingUserId !== null) {
        await updateUser({
          userId: String(editingUserId),
          user: nextValues,
        });
        setNotice({
          tone: "success",
          message: "ユーザーを更新しました",
        });
      }

      resetDialog();
    } catch (submitError) {
      setNotice({
        tone: "error",
        message: getErrorMessage(submitError),
        error: submitError,
      });
    }
  }

  /**
   * 削除前に確認を取り、成功時は一覧の状態表示も更新する
   */
  async function handleDelete(user: User) {
    const confirmed = window.confirm(`${user.name} を削除しますか`);

    if (!confirmed) {
      return;
    }

    setNotice(null);
    setDeletingUserId(user.id);

    try {
      await deleteUser(String(user.id));
      setNotice({
        tone: "success",
        message: "ユーザーを削除しました",
      });
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message: getErrorMessage(deleteError),
        error: deleteError,
      });
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">SWR Users Demo</h1>
          <p className="text-sm text-muted-foreground">
            SWR 2 の標準的な loading / error / mutation フローで CRUD
            を扱う実装例
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "再取得中..." : "再取得"}
          </Button>
          <Button type="button" onClick={handleCreateClick} disabled={isBusy}>
            ユーザーを追加
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
          {notice.tone === "error" && notice.error ? (
            <ErrorSummary error={notice.error} message={notice.message} />
          ) : (
            notice.message
          )}
        </div>
      ) : null}

      {!notice && mutationError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <ErrorSummary error={mutationError} />
        </div>
      ) : null}

      <section aria-busy={isLoading || isBusy}>
        {error ? (
          <UsersErrorState
            error={error}
            onRetry={() => void handleRefresh()}
            isRetrying={isRefreshing}
          />
        ) : null}

        {!error && isLoading && users.length === 0 ? (
          <UsersLoadingSkeleton count={6} />
        ) : null}

        {!error && (!isLoading || users.length > 0) ? (
          <UsersList
            users={users}
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
        onOpenChange={handleDialogOpenChange}
        onValueChange={handleFormValueChange}
        onSubmitAction={handleSubmit}
      />
    </div>
  );
}
