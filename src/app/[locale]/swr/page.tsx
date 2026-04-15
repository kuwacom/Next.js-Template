"use client";

import React, { Suspense, useState } from "react";
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

type ErrorBoundaryLabels = {
  failedToLoadUsers: string;
  retry: string;
  reloadPage: string;
};

type UsersListLabels = {
  email: string;
  edit: string;
  delete: string;
};

/* ============================
   ErrorBoundary
   Suspense で投げられた例外（fetch エラー等）をキャッチしてリトライUIを表示する
   ============================ */
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    labels: ErrorBoundaryLabels;
    onReset?: () => void;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    labels: ErrorBoundaryLabels;
    onReset?: () => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <p className="mb-4 text-lg text-red-600">
            {this.props.labels.failedToLoadUsers}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            {String(this.state.error)}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onReset?.();
              }}
            >
              {this.props.labels.retry}
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              {this.props.labels.reloadPage}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ============================
   UsersLoadingSkeleton (SVGアニメーション)
   - 各カードの「ロード中バージョン」を SVG で表現
   - Tailwind の animate-pulse を wrapper に付与して脈動するアニメーションに
   - count: 表示するスケルトンカード数
   ============================ */
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
          // animate-pulse を親に付けて内部 SVG を脈動させる
          className="animate-pulse rounded-lg border bg-card p-4"
          aria-hidden
        >
          {/* SVG: avatar + two text lines + two buttons を表現 */}
          <svg
            viewBox="0 0 360 120"
            width="100%"
            height="120"
            className="h-30 w-full"
          >
            {/* 背景の四角（カードのコンテント領域） */}
            <rect x="0" y="0" width="360" height="120" rx="8" fill="none" />

            {/* 左の丸（avatar） */}
            <circle cx="36" cy="36" r="24" className="fill-muted" />

            {/* 名前のライン（長め） */}
            <rect
              x="72"
              y="18"
              rx="6"
              width="220"
              height="14"
              className="fill-muted"
            />

            {/* メールのライン（短め） */}
            <rect
              x="72"
              y="40"
              rx="6"
              width="160"
              height="12"
              className="fill-muted"
            />

            {/* 下部のボタン風ブロック（2つ） */}
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

            {/* 右上の小さなメタ情報（ダミー） */}
            <rect
              x="300"
              y="18"
              rx="6"
              width="40"
              height="12"
              className="fill-muted"
            />
          </svg>

          {/* 補助のテキスト（スクリーンリーダー無関係） */}
          <div className="sr-only">{loadingLabel}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================
   UsersList: 実データを表示するカードリスト
   - Suspense の中で呼ばれることを想定しているので、通常は users は存在する
   - それでも安全のため users?.map を使って無闇なクラッシュを防ぐ
   ============================ */
function UsersList({
  labels,
  onEdit,
  onDelete,
}: {
  labels: UsersListLabels;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}) {
  const { users } = useUsers();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users?.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {labels.email}: {user.email}
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => onEdit(user)}>
                {labels.edit}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(user.id)}
              >
                {labels.delete}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ============================
   Page Component
   - Dialog 管理、CRUD 呼び出し、Suspense + ErrorBoundary の組み合わせ
   ============================ */
export default function SWRPage() {
  // mutate をここで使いたいので useUsers() を呼んでおく
  // （suspense: true のため、この呼び出し自体は Suspense の挙動に影響することに注意）
  const t = useTranslations("swr");
  const { mutate } = useUsers();
  const { addUser } = useAddUser();
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();

  // 編集ダイアログ用 state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 追加ダイアログ用 state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");

  const errorLabels: ErrorBoundaryLabels = {
    failedToLoadUsers: t("failedToLoadUsers"),
    retry: t("retry"),
    reloadPage: t("reloadPage"),
  };

  const listLabels: UsersListLabels = {
    email: t("email"),
    edit: t("edit"),
    delete: t("delete"),
  };

  /* --- ハンドラ --- */
  function handleEdit(user: User) {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setIsDialogOpen(true);
  }

  async function handleDelete(userId: number) {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    try {
      await deleteUser(userId.toString());
    } catch {
      alert(t("deleteFailed"));
    }
  }

  async function handleSave() {
    if (!editingUser) {
      return;
    }

    try {
      await updateUser({
        userId: editingUser.id.toString(),
        user: {
          name,
          email,
        },
      });
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch {
      alert(t("updateFailed"));
    }
  }

  async function handleAddUser() {
    try {
      await addUser({ name: addName, email: addEmail });
      setIsAddDialogOpen(false);
      setAddName("");
      setAddEmail("");
    } catch {
      alert(t("addFailed"));
    }
  }

  function handleReset() {
    void mutate();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">{t("usersList")}</h1>

      <div className="mb-4 flex gap-2">
        <Button onClick={() => mutate()}>{t("refresh")}</Button>
        <Button onClick={() => setIsAddDialogOpen(true)}>{t("addUser")}</Button>
      </div>

      {/* ErrorBoundary + Suspense：fallback に SVG スケルトンを渡す */}
      <ErrorBoundary labels={errorLabels} onReset={handleReset}>
        <Suspense
          fallback={
            <UsersLoadingSkeleton count={6} loadingLabel={t("loadingUserCard")} />
          }
        >
          <UsersList
            labels={listLabels}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSave}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addName">{t("name")}</Label>
              <Input
                id="addName"
                value={addName}
                onChange={(event) => setAddName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="addEmail">{t("email")}</Label>
              <Input
                id="addEmail"
                value={addEmail}
                onChange={(event) => setAddEmail(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleAddUser}>{t("add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
