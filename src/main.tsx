import { For, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import { io, type Socket } from "socket.io-client";
import "./styles.css";

const SERVER_URL = "https://monkey.elumapp.ru";
const APP_ID = 1;
const APP_PLATFORM = "tma";
const SOCKET_PATH = "/ws";
const TASKS_LOCALE = "ru";
const AUTH_TIMEOUT_MS = 8000;

type TelegramWebApp = {
  initData: string;
  colorScheme?: "light" | "dark";
  ready: () => void;
  expand: () => void;
};

type Envelope<T> = {
  response?: T;
  error?: {
    key: string;
    message: string;
  };
};

type TaskLocalization = {
  title?: string;
  description?: string;
};

type TaskProgress = {
  progress?: number;
  target_count?: number;
  status?: string;
};

type TaskReward = {
  key?: string;
  type?: string;
  quantity?: number;
  unit?: string;
};

type Task = {
  id?: string | number;
  key?: string;
  title?: string;
  description?: string;
  localization?: TaskLocalization;
  progress?: TaskProgress;
  rewards?: TaskReward[];
  status?: string;
  is_active?: boolean;
  is_visible?: boolean;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

function telegramApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

function getLaunchParams(): string {
  return telegramApp()?.initData ?? "";
}

function taskTitle(task: Task): string {
  return task.localization?.title || task.title || task.key || String(task.id ?? "Task");
}

function taskDescription(task: Task): string {
  return task.localization?.description || task.description || "";
}

function taskStatus(task: Task): string {
  return task.progress?.status || task.status || "unknown";
}

function rewardLabel(reward: TaskReward): string {
  const quantity = reward.quantity ?? 0;
  const key = reward.key || "reward";
  if (reward.type === "duration" && reward.unit) {
    return `${quantity} ${key} / ${reward.unit}`;
  }
  return `${quantity} ${key}`;
}

function unwrapAck<T>(payload: Envelope<T>): T {
  if (payload.error) {
    throw new Error(`${payload.error.key}: ${payload.error.message}`);
  }
  return payload.response as T;
}

function emitAck<T>(socket: Socket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(10000).emit(event, payload, (err: Error | null, ack: Envelope<T>) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(unwrapAck<T>(ack));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function App() {
  const [socket, setSocket] = createSignal<Socket | null>(null);
  const [connected, setConnected] = createSignal(false);
  const [authorized, setAuthorized] = createSignal(false);
  const [authUser, setAuthUser] = createSignal<unknown>(null);
  const [tasks, setTasks] = createSignal<Task[]>([]);
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [log, setLog] = createSignal<string[]>([]);

  const initData = createMemo(getLaunchParams);
  const hasTelegramData = createMemo(() => initData().length > 0);
  const statusLabel = createMemo(() => {
    if (authorized()) return "Authorized";
    if (connected()) return "Connected";
    if (loading()) return "Connecting";
    return "Disconnected";
  });

  function addLog(message: string) {
    setLog((items) => [`${new Date().toLocaleTimeString()} ${message}`, ...items].slice(0, 20));
  }

  async function loadTasks(client: Socket) {
    const result = await emitAck<Task[]>(client, "tasks.list", { locale: TASKS_LOCALE });
    setTasks(Array.isArray(result) ? result : []);
    addLog(`tasks loaded: ${Array.isArray(result) ? result.length : 0}`);
  }

  onMount(() => {
    const tg = telegramApp();
    tg?.ready();
    tg?.expand();

    if (!hasTelegramData()) {
      setError("Telegram initData is empty. Open this page as a Telegram Mini App.");
      addLog("telegram initData is empty, socket connection skipped");
      return;
    }

    setLoading(true);
    setError("");

    const client = io(SERVER_URL, {
      path: SOCKET_PATH,
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      auth: {
        app_id: APP_ID,
        app_platform: APP_PLATFORM,
        params: initData(),
      },
    });

    setSocket(client);
    let authTimeout = window.setTimeout(() => {
      if (!authorized()) {
        setLoading(false);
        setError("Socket connected, but authorization response was not received.");
        addLog("auth timeout");
        client.disconnect();
      }
    }, AUTH_TIMEOUT_MS);

    client.on("connect", () => {
      setConnected(true);
      addLog(`socket connected: ${client.id}`);
    });

    client.on("connect_error", (value) => {
      setLoading(false);
      setError(value.message);
      addLog(`connect_error: ${value.message}`);
    });

    client.on("disconnect", (reason) => {
      setConnected(false);
      setAuthorized(false);
      setLoading(false);
      addLog(`socket disconnected: ${reason}`);
      if (!authUser()) {
        setError(`Socket disconnected before authorization: ${reason}`);
      }
    });

    client.on("auth", async (payload: Envelope<{ user: unknown }>) => {
      try {
        window.clearTimeout(authTimeout);
        const response = unwrapAck(payload);
        setAuthorized(true);
        setAuthUser(response.user);
        addLog("auth ok");
        await loadTasks(client);
      } catch (value) {
        setError(value instanceof Error ? value.message : String(value));
      } finally {
        setLoading(false);
      }
    });

    onCleanup(() => {
      window.clearTimeout(authTimeout);
      client.disconnect();
    });
  });

  return (
    <main class="page">
      <section class="hero">
        <div>
          <p class="eyebrow">Mini App Monkey</p>
          <h1>Daily tasks smoke test</h1>
          <p class="muted">
            Шаблон подключается к Socket.IO серверу, авторизуется через Telegram initData и
            запрашивает список заданий.
          </p>
        </div>
        <div classList={{ badge: true, ok: authorized(), bad: !authorized() }}>
          {statusLabel()}
        </div>
      </section>

      <Show when={!hasTelegramData()}>
        <div class="notice">
          Telegram initData пустой. Открой страницу внутри Telegram Mini App, иначе сервер не
          сможет проверить подпись.
        </div>
      </Show>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>

      <section class="panel">
        <div class="panel-header">
          <h2>Tasks</h2>
          <button
            type="button"
            disabled={!socket() || !authorized() || loading()}
            onClick={() => {
              const client = socket();
              if (!client) return;
              setLoading(true);
              setError("");
              loadTasks(client)
                .catch((value) => setError(value instanceof Error ? value.message : String(value)))
                .finally(() => setLoading(false));
            }}
          >
            Refresh
          </button>
        </div>

        <Show when={!loading()} fallback={<div class="empty">Loading tasks...</div>}>
          <Show when={tasks().length > 0} fallback={<div class="empty">No tasks yet</div>}>
            <div class="task-list">
              <For each={tasks()}>
                {(task) => (
                  <article class="task-card">
                    <div>
                      <h3>{taskTitle(task)}</h3>
                      <Show when={taskDescription(task)}>
                        <p>{taskDescription(task)}</p>
                      </Show>
                    </div>
                    <div class="task-meta">
                      <span>{taskStatus(task)}</span>
                      <Show when={task.progress?.target_count}>
                        <span>
                          {task.progress?.progress ?? 0}/{task.progress?.target_count}
                        </span>
                      </Show>
                    </div>
                    <Show when={task.rewards?.length}>
                      <div class="rewards">
                        <For each={task.rewards}>{(reward) => <span>{rewardLabel(reward)}</span>}</For>
                      </div>
                    </Show>
                  </article>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </section>

      <section class="panel small">
        <h2>Debug</h2>
        <pre>{JSON.stringify({ server: SERVER_URL, authUser: authUser() }, null, 2)}</pre>
        <div class="log">
          <For each={log()}>{(item) => <div>{item}</div>}</For>
        </div>
      </section>
    </main>
  );
}

render(() => <App />, document.getElementById("root")!);
