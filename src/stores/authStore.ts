type AuthStatus = "anonymous" | "authenticated";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  authVersion: number;
};

type SessionInput = {
  accessToken: string;
  refreshToken?: string | null;
};

type Listener = () => void;

const ACCESS_TOKEN_STORAGE_KEY = "token";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

const listeners = new Set<Listener>();

/*
 * authStore は React の外でも参照できる認証状態の単一ストア
 *
 * - apiClient は毎回この store から最新 token を取得する
 * - useAuth は useSyncExternalStore でこの store を購読する
 * - authVersion を更新することで、SWR key に認証変更を反映できる
 *
 * UI と API 層が同じ認証状態を参照しつつ
 * token 更新時に各種 useSWR hook を自動再評価できる構造
 */
function canUseStorage() {
  return typeof window !== "undefined";
}

/*
 * localStorage は SSR では使えないため
 * 必ずブラウザ判定を経由してから読む
 */
function readStorageValue(key: string) {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
}

function createAuthState(
  accessToken: string | null,
  refreshToken: string | null,
  authVersion: number,
): AuthState {
  return {
    accessToken,
    refreshToken,
    status: accessToken ? "authenticated" : "anonymous",
    authVersion,
  };
}

/*
 * 初期化時は localStorage から token を復元する
 * セッション情報がある場合は authVersion を 1 にして認証済みとして扱う
 */
function getInitialState(): AuthState {
  if (!canUseStorage()) {
    return createAuthState(null, null, 0);
  }

  const accessToken = readStorageValue(ACCESS_TOKEN_STORAGE_KEY);
  const refreshToken = readStorageValue(REFRESH_TOKEN_STORAGE_KEY);

  return createAuthState(
    accessToken,
    refreshToken,
    accessToken || refreshToken ? 1 : 0,
  );
}

let state = getInitialState();
let hasBoundStorageListener = false;

/*
 * 購読への通知は setState を通して一元化する
 * React 側は外部ストアの変更だけを監視すればよい
 */
function emitChange() {
  listeners.forEach((listener) => listener());
}

/*
 * state 変更後の永続化処理
 * token が null の場合は localStorage から除去してログアウト状態も反映する
 */
function persistState(nextState: AuthState) {
  if (!canUseStorage()) {
    return;
  }

  if (nextState.accessToken) {
    window.localStorage.setItem(
      ACCESS_TOKEN_STORAGE_KEY,
      nextState.accessToken,
    );
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  if (nextState.refreshToken) {
    window.localStorage.setItem(
      REFRESH_TOKEN_STORAGE_KEY,
      nextState.refreshToken,
    );
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

/*
 * authStore の内部状態更新はすべてこの関数を経由する
 * persist を false にすると storage イベント由来の二重書き込みを避けられる
 */
function setState(nextState: AuthState, persist = true) {
  state = nextState;

  if (persist) {
    persistState(nextState);
  }

  emitChange();
}

/*
 * 別タブで token が変わった場合も同じ認証状態に追従する
 * storage イベントを拾って authVersion を進める
 */
function handleStorageChange(event: StorageEvent) {
  if (
    event.key !== null &&
    event.key !== ACCESS_TOKEN_STORAGE_KEY &&
    event.key !== REFRESH_TOKEN_STORAGE_KEY
  ) {
    return;
  }

  const accessToken = readStorageValue(ACCESS_TOKEN_STORAGE_KEY);
  const refreshToken = readStorageValue(REFRESH_TOKEN_STORAGE_KEY);

  setState(
    createAuthState(accessToken, refreshToken, state.authVersion + 1),
    false,
  );
}

/*
 * storage イベント購読は一度だけ登録する
 * subscribe のたびに addEventListener しないようフラグで制御する
 */
function bindStorageListener() {
  if (!canUseStorage() || hasBoundStorageListener) {
    return;
  }

  window.addEventListener("storage", handleStorageChange);
  hasBoundStorageListener = true;
}

export const authStore = {
  /**
   * `useSyncExternalStore` から利用する購読関数
   *
   * 認証状態が変わるたびに listener を呼び出し
   * `useAuth` や認証連動する hook 群の再評価を発生させる
   */
  subscribe(listener: Listener) {
    bindStorageListener();
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * 現在の認証状態を取得する
   *
   * React 外のコード
   * 特に `apiClient` から最新 access token を読むために使う
   * 名前は `useSyncExternalStore` の API に合わせて getSnapshot としている
   */
  getSnapshot() {
    return state;
  },

  /**
   * SSR 時に参照する初期スナップショットを返す
   *
   * サーバーでは localStorage が使えないため
   * 未認証状態を返す
   */
  getServerSnapshot() {
    return createAuthState(null, null, 0);
  },

  /**
   * access token / refresh token をまとめて更新する
   *
   * login や token refresh 完了時の入口として使う
   * `authVersion` も同時に進めて SWR 側へ変更を伝播させる
   */
  setSession({ accessToken, refreshToken = null }: SessionInput) {
    setState(createAuthState(accessToken, refreshToken, state.authVersion + 1));
  },

  /**
   * access token だけを差し替える
   *
   * refresh token を保持したまま access token のみ更新したい時に使う
   * こちらも `authVersion` を進めるため認証付き query は自動再評価される
   */
  setAccessToken(accessToken: string | null) {
    setState(
      createAuthState(accessToken, state.refreshToken, state.authVersion + 1),
    );
  },

  /**
   * セッション情報をすべて破棄して未認証状態へ戻す
   *
   * logout の実体
   * localStorage の token も同時に削除する
   */
  clearSession() {
    setState(createAuthState(null, null, state.authVersion + 1));
  },
};
