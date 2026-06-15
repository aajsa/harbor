import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { openUrl } from "@/lib/window";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";

export type FieldStatus = { state: "idle" | "busy" | "ok" | "error"; message: string | null };

export function WebhookField({
  label,
  placeholder,
  value,
  onChange,
  onTest,
  status,
  help,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onTest: () => void;
  status: FieldStatus;
  help: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-edge-soft bg-canvas/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-ink">{label}</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="h-10 flex-1 rounded-lg border border-edge bg-canvas px-3 font-mono text-[12px] text-ink outline-none transition-colors focus:border-ink-subtle"
        />
        <button
          onClick={onTest}
          disabled={!value || status.state === "busy"}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-4 text-[12.5px] font-semibold text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status.state === "busy" && <Loader2 size={12} strokeWidth={2.4} className="animate-spin" />}
          {t("Send test")}
        </button>
      </div>
      <div className="rounded-lg bg-canvas/60 p-3 text-[12px] leading-relaxed text-ink-muted">
        {help}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: FieldStatus }) {
  if (status.state === "idle") return null;
  const palette =
    status.state === "ok"
      ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
      : status.state === "error"
        ? "border-rose-300/40 bg-rose-400/15 text-rose-100"
        : "border-edge bg-elevated/40 text-ink-muted";
  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${palette}`}
    >
      {status.state === "ok" && <Check size={11} strokeWidth={2.6} />}
      {status.state === "error" && <X size={11} strokeWidth={2.6} />}
      {status.state === "busy" && <Loader2 size={11} strokeWidth={2.4} className="animate-spin" />}
      {status.message}
    </span>
  );
}

export function DiscordTutorial() {
  const t = useT();
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[12px] text-ink-muted">
        {t("Discord posts a message to a channel whenever Harbor pings it. Takes about a minute to set up.")}
      </p>
      <ol className="ms-4 list-decimal space-y-1.5 text-[12px] text-ink-muted marker:text-ink-subtle">
        <li>{t("Open the Discord server where you want notifications to land.")}</li>
        <li>{t("Right-click a text channel, pick")} <span className="text-ink">{t("Edit Channel")}</span>.</li>
        <li>{t("Click")} <span className="text-ink">{t("Integrations")}</span> {t("on the left, then")} <span className="text-ink">{t("Webhooks")}</span>.</li>
        <li>{t("Click")} <span className="text-ink">{t("New Webhook")}</span>, {t("name it Harbor, hit")} <span className="text-ink">{t("Copy Webhook URL")}</span>.</li>
        <li>{t("Paste the URL into the box above and send a test.")}</li>
      </ol>
      <p className="text-[11.5px] text-ink-subtle">
        {t("No Integrations option? You need the Manage Webhooks permission. Ask whoever owns the server.")}
      </p>
      <ExternalLinkButton
        label={t("Open Discord's webhook help")}
        url="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
      />
    </div>
  );
}

export function TelegramTutorial() {
  const t = useT();
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[12px] text-ink-muted">
        {t("Telegram sends through a bot you create. You need two things: a")} <span className="text-ink">{t("bot token")}</span> {t("and your")} <span className="text-ink">{t("chat ID")}</span>. {t("Both go in the boxes above. Harbor builds the URL for you.")}
      </p>
      <ol className="ms-4 list-decimal space-y-1.5 text-[12px] text-ink-muted marker:text-ink-subtle">
        <li>{t("Tap")} <span className="text-ink">{t("Open BotFather")}</span> {t("below. In Telegram, send him")} <span className="font-mono text-ink">/newbot</span>. {t("Pick any name. Pick a username ending in")} <span className="font-mono text-ink">bot</span>.</li>
        <li>{t("BotFather replies with a token like")} <span className="font-mono text-ink">1234567890:AAExample...</span>. {t("Long string with a colon in it. Copy it. Paste it into the")} <span className="text-ink">{t("Bot token")}</span> {t("box above.")}</li>
        <li>{t("Open the bot BotFather just made (he sends you a link). Send it any message so it's allowed to message you back.")}</li>
        <li>{t("Tap")} <span className="text-ink">{t("Open userinfobot")}</span> {t("below. Send it")} <span className="font-mono text-ink">/start</span>. {t("It replies with your numeric ID. Copy that number. Paste it into the")} <span className="text-ink">{t("Chat ID")}</span> {t("box above.")}</li>
        <li>{t("Hit")} <span className="text-ink">{t("Send test")}</span>. {t("You should get a message from your new bot.")}</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <ExternalLinkButton label={t("Open BotFather")} url="https://t.me/botfather" />
        <ExternalLinkButton label={t("Open userinfobot")} url="https://t.me/userinfobot" />
      </div>
    </div>
  );
}

function ExternalLinkButton({ label, url }: { label: string; url: string }) {
  return (
    <button
      type="button"
      onClick={() => openUrl(url)}
      className="inline-flex items-center gap-1.5 self-start rounded-lg border border-edge-soft bg-canvas/60 px-3 py-1.5 text-[11.5px] font-semibold text-ink transition-colors hover:border-edge hover:bg-canvas/80"
    >
      {label}
      <ExternalLink size={11} strokeWidth={2.2} />
    </button>
  );
}
