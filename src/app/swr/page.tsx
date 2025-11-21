"use client";

import React, { Suspense, useState } from "react";
import {
  useUsers,
  updateUser,
  deleteUser,
  addUser,
} from "@/api/users/useUsers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/api";

/* ============================
   ErrorBoundary
   Suspense で投げられた例外（fetch エラー等）をキャッチしてリトライUIを表示する
   ============================ */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <p className="text-red-600 text-lg mb-4">Failed to load users.</p>
          <p className="text-sm text-muted-foreground mb-6">
            {String(this.state.error)}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onReset?.();
              }}
            >
              Retry
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Reload Page
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
function UsersLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          // animate-pulse を親に付けて内部 SVG を脈動させる
          className="p-4 border rounded-lg bg-card animate-pulse"
          aria-hidden
        >
          {/* SVG: avatar + two text lines + two buttons を表現 */}
          <svg
            viewBox="0 0 360 120"
            width="100%"
            height="120"
            className="w-full h-30"
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
          <div className="sr-only">Loading user card</div>
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
  onEdit,
  onDelete,
}: {
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
}) {
  const { users } = useUsers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users?.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => onEdit(user)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(user.id)}
              >
                Delete
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
  const { mutate } = useUsers();

  // 編集ダイアログ用 state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 追加ダイアログ用 state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");

  /* --- ハンドラ --- */
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId.toString());
      mutate((current) => current?.filter((u) => u.id !== userId), {
        revalidate: true,
      });
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const updatedUser = await updateUser(editingUser.id.toString(), {
        name,
        email,
      });
      mutate(
        (current) =>
          current?.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        {
          revalidate: true,
        }
      );
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      alert("Failed to update user");
    }
  };

  const handleAddUser = async () => {
    try {
      const newUser = await addUser({ name: addName, email: addEmail });
      mutate((current) => [...(current || []), newUser], { revalidate: true });
      setIsAddDialogOpen(false);
      setAddName("");
      setAddEmail("");
    } catch (error) {
      alert("Failed to add user");
    }
  };

  const handleReset = () => mutate();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users List</h1>

      <div className="flex gap-2 mb-4">
        <Button onClick={() => mutate()}>Refresh</Button>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add User</Button>
      </div>

      {/* ErrorBoundary + Suspense：fallback に SVG スケルトンを渡す */}
      <ErrorBoundary onReset={handleReset}>
        <Suspense fallback={<UsersLoadingSkeleton count={6} />}>
          <UsersList onEdit={handleEdit} onDelete={handleDelete} />
        </Suspense>
      </ErrorBoundary>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addName">Name</Label>
              <Input
                id="addName"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="addEmail">Email</Label>
              <Input
                id="addEmail"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
