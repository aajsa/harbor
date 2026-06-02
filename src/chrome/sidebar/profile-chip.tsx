import { Lock, LogIn, LogOut, Pencil, Plus, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { CatAvatar } from "@/components/icons/cat-avatar";
import { useAuth } from "@/lib/auth";
import { useProfiles, type Profile } from "@/lib/profiles";
import { useSettings } from "@/lib/settings";
import type { User } from "@/lib/stremio";
import { openUrl } from "@/lib/window";

const STREMIO_REGISTER_URL = "https://www.stremio.com/register";

export function ProfileChip() {
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const { profiles, activeProfile, openPicker, selectProfile } = useProfiles();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const otherProfiles = profiles.filter((p) => p.id !== activeProfile?.id);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={activeProfile?.name ?? user?.email ?? "Profile"}
        className="flex w-full items-center justify-center gap-3.5 rounded-xl py-2.5 text-left transition-colors hover:bg-elevated/60 lg:justify-start lg:px-3"
      >
        <ProfileAvatar profile={activeProfile} user={user} fallbackAvatar={settings.harborAvatar} />
        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="truncate text-[14.5px] font-medium tracking-tight text-ink">
            {activeProfile?.name ?? user?.fullname ?? user?.email?.split("@")[0] ?? "Profile"}
          </div>
          <div className="truncate text-[12px] text-ink-subtle">
            <SubtitleText active={activeProfile} profiles={profiles} user={user} />
          </div>
        </div>
      </button>

      {menuOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-1.5 overflow-hidden rounded-xl border border-edge bg-elevated shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] lg:left-4 lg:right-4">
          {otherProfiles.length > 0 && (
            <div className="flex flex-col gap-0.5 border-b border-edge-soft p-1.5">
              <span className="px-2.5 pb-1 pt-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
                Switch profile
              </span>
              {otherProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setMenuOpen(false);
                    if (p.passwordHash) {
                      openPicker({ kind: "unlock", profileId: p.id });
                    } else {
                      selectProfile(p.id);
                    }
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-raised"
                >
                  <span className="relative inline-flex shrink-0">
                    <ProfileAvatar profile={p} user={null} fallbackAvatar={null} compact />
                    {p.passwordHash && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-canvas text-ink shadow-sm ring-1 ring-edge">
                        <Lock size={8} strokeWidth={2.6} />
                      </span>
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                    {p.isPrimary && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: p.color }}
                      >
                        Primary
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col">
            <button
              onClick={() => {
                openPicker({ kind: "list" });
                setMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-4 py-3 text-left text-[13.5px] text-ink-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <Users size={14} strokeWidth={2.2} />
              Who's watching
            </button>
            {activeProfile && (
              <button
                onClick={() => {
                  openPicker({ kind: "edit", profileId: activeProfile.id });
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-4 py-3 text-left text-[13.5px] text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <Pencil size={14} strokeWidth={2.2} />
                Edit this profile
              </button>
            )}
            {activeProfile?.isPrimary && (
              <button
                onClick={() => {
                  openPicker({ kind: "create" });
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-4 py-3 text-left text-[13.5px] text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <Plus size={14} strokeWidth={2.2} />
                New profile
              </button>
            )}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 border-t border-edge-soft px-4 py-3 text-left text-[13.5px] text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <LogOut size={14} strokeWidth={2.2} />
                Sign out of Stremio
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthOpen(true);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 border-t border-edge-soft px-4 py-3 text-left text-[13.5px] text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                <LogIn size={14} strokeWidth={2.2} />
                Sign in to Stremio
              </button>
            )}
          </div>
        </div>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

function ProfileAvatar({
  profile,
  user,
  fallbackAvatar,
  compact,
}: {
  profile: Profile | null;
  user: User | null;
  fallbackAvatar: string | null;
  compact?: boolean;
}) {
  const dim = compact ? "h-9 w-9" : "h-12 w-12";
  const src = profile?.avatar ?? fallbackAvatar ?? user?.avatar ?? null;
  const ringStyle = profile?.color ? { boxShadow: `0 0 0 2px ${profile.color}` } : undefined;
  return (
    <div
      className={`${dim} shrink-0 overflow-hidden rounded-full bg-elevated`}
      style={ringStyle}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <CatAvatar className="h-full w-full" />
      )}
    </div>
  );
}

function SubtitleText({
  active,
  profiles,
  user,
}: {
  active: Profile | null;
  profiles: Profile[];
  user: User | null;
}) {
  if (active?.shareStremioWith) {
    const src = profiles.find((p) => p.id === active.shareStremioWith);
    if (src) return <>Sharing {src.name}'s Stremio</>;
  }
  if (user) {
    return <>Signed in to Stremio</>;
  }
  return (
    <>
      Sign in to{" "}
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          openUrl(STREMIO_REGISTER_URL);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openUrl(STREMIO_REGISTER_URL);
          }
        }}
        className="cursor-pointer text-ink transition-colors hover:text-accent"
      >
        Stremio
      </span>
    </>
  );
}
