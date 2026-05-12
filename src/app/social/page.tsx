"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface UserResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_emoji: string;
}

interface FriendEntry {
  friend_id: string;
  username: string;
  display_name: string | null;
  avatar_emoji: string;
  status: "pending" | "accepted" | "declined";
  direction: "sent" | "received";
  created_at: string;
}

interface ChallengeEntry {
  id: string;
  game_type: string;
  status: string;
  challenger_score: number | null;
  challenged_score: number | null;
  expires_at: string;
  created_at: string;
  completed_at: string | null;
  role: "challenger" | "challenged";
  challenger_username: string;
  challenger_display: string | null;
  challenger_emoji: string;
  challenged_username: string;
  challenged_display: string | null;
  challenged_emoji: string;
}

const GAME_LABELS: Record<string, string> = {
  speed_match: "⚡ Speed Match",
  kana_rain: "🌧️ Kana Rain",
  memory: "🃏 Mémory",
  sens_cache: "👁️ Sens Caché",
  fill_blank: "✍️ Histoire à trous",
};

const GAME_LINKS: Record<string, string> = {
  speed_match: "/game/speed-match",
  kana_rain: "/game/kana-rain",
  memory: "/game/memory",
  sens_cache: "/game/sens-cache",
  fill_blank: "/game/histoire-a-trous",
};

// ----------------------------------------------------------------
// Toast system
// ----------------------------------------------------------------
type ToastType = "success" | "error" | "info";
interface Toast { id: number; msg: string; type: ToastType }

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 ${
            t.type === "success" ? "bg-green-500/90" :
            t.type === "error"   ? "bg-red-500/90" :
                                   "bg-indigo-500/90"
          }`}
        >
          {t.type === "success" ? "✓ " : t.type === "error" ? "✕ " : "ℹ "}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const show = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++nextId.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

// ----------------------------------------------------------------
// Composants utilitaires
// ----------------------------------------------------------------
function Avatar({ emoji, size = "md" }: { emoji?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-lg" : size === "lg" ? "w-14 h-14 text-3xl" : "w-10 h-10 text-xl";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200/60 flex items-center justify-center flex-shrink-0`}>
      {emoji || "🎌"}
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />;
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="text-center py-10 space-y-2">
      <div className="text-4xl">{icon}</div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children, count, color = "slate" }: { children: React.ReactNode; count?: number; color?: string }) {
  const cls: Record<string, string> = {
    slate: "text-slate-500",
    amber: "text-amber-700",
    green: "text-green-700",
    indigo: "text-indigo-700",
  };
  return (
    <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${cls[color] ?? "text-slate-500"} flex items-center gap-2`}>
      {children}
      {count !== undefined && (
        <span className="inline-block text-[10px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </h3>
  );
}

// ----------------------------------------------------------------
// Onglet Amis
// ----------------------------------------------------------------
function FriendsTab({ toast }: { toast: (msg: string, type?: ToastType) => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searching, setSearching] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    setFriendsError(null);
    try {
      const res = await fetch("/api/friends");
      if (res.status === 401) { router.replace("/login"); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setFriends(await res.json());
    } catch {
      setFriendsError("Impossible de charger les amis.");
    } finally {
      setLoadingFriends(false);
    }
  }, [router]);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`);
        if (res.ok) setResults(await res.json());
      } catch { /* ignore */ }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const withPending = (id: string, fn: () => Promise<void>) => async () => {
    setPendingActions(prev => new Set(prev).add(id));
    try { await fn(); }
    finally { setPendingActions(prev => { const s = new Set(prev); s.delete(id); return s; }); }
  };

  const sendRequestToUser = (userId: string) => withPending(userId, async () => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId: userId }),
    });
    if (res.ok) {
      toast("Demande envoyée !", "success");
      setSearch("");
      setResults([]);
      await loadFriends();
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error === "Already friends or request pending" ? "Déjà ami ou demande en attente" : "Impossible d'envoyer la demande", "error");
    }
  })();

  const respondToRequest = (requesterId: string, action: "accept" | "decline") => withPending(requesterId, async () => {
    const res = await fetch(`/api/friends/${requesterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      toast(action === "accept" ? "Ami ajouté !" : "Demande refusée", action === "accept" ? "success" : "info");
      await loadFriends();
    } else {
      toast("Action impossible", "error");
    }
  })();

  const removeFriend = (friendId: string, isPending: boolean) => withPending(friendId, async () => {
    const label = isPending ? "Annuler la demande ?" : "Supprimer cet ami ?";
    if (!confirm(label)) return;
    const res = await fetch(`/api/friends/${friendId}`, { method: "DELETE" });
    if (res.ok) {
      toast(isPending ? "Demande annulée" : "Ami supprimé", "info");
      await loadFriends();
    } else {
      toast("Action impossible", "error");
    }
  })();

  const accepted = friends.filter(f => f.status === "accepted");
  const incoming = friends.filter(f => f.status === "pending" && f.direction === "received");
  const outgoing = friends.filter(f => f.status === "pending" && f.direction === "sent");
  const friendIds = new Set(friends.map(f => f.friend_id));

  return (
    <div className="space-y-4">
      <div className="bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-700">🔍 Trouver un joueur</h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nom d'utilisateur (2 caractères min)..."
            className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner />
            </div>
          )}
        </div>
        {results.length > 0 && (
          <div className="space-y-1.5">
            {results.map(u => {
              const alreadyFriend = friendIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/60 transition-colors">
                  <Avatar emoji={u.avatar_emoji} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.display_name || u.username}</p>
                    <p className="text-xs text-slate-400">@{u.username}</p>
                  </div>
                  {alreadyFriend ? (
                    <span className="text-xs text-green-600 font-medium">✓ Ami</span>
                  ) : (
                    <button
                      onClick={() => sendRequestToUser(u.id)}
                      disabled={pendingActions.has(u.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {pendingActions.has(u.id) ? <Spinner /> : null}
                      + Ajouter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {search.length >= 2 && !searching && results.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Aucun joueur trouvé pour « {search} »</p>
        )}
      </div>

      {incoming.length > 0 && (
        <div className="bg-amber-50/90 rounded-2xl border border-amber-200/80 shadow-sm p-4 space-y-3">
          <SectionTitle count={incoming.length} color="amber">🔔 Demandes reçues</SectionTitle>
          {incoming.map(f => (
            <div key={f.friend_id} className="flex items-center gap-3">
              <Avatar emoji={f.avatar_emoji} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{f.display_name || f.username}</p>
                <p className="text-xs text-slate-400">@{f.username}</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => respondToRequest(f.friend_id, "accept")}
                  disabled={pendingActions.has(f.friend_id)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {pendingActions.has(f.friend_id) ? <Spinner /> : "✓"} Accepter
                </button>
                <button
                  onClick={() => respondToRequest(f.friend_id, "decline")}
                  disabled={pendingActions.has(f.friend_id)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 font-semibold hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle count={accepted.length} color="indigo">👥 Mes amis</SectionTitle>
          <button
            onClick={loadFriends}
            className="text-lg text-indigo-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-indigo-50"
            title="Rafraîchir"
          >
            {loadingFriends ? <Spinner /> : "↻"}
          </button>
        </div>
        {friendsError && <p className="text-xs text-red-500 text-center py-2">{friendsError}</p>}
        {loadingFriends && !friendsError ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : accepted.length === 0 ? (
          <EmptyState icon="🤝" title="Aucun ami pour l'instant" sub="Cherche des joueurs ci-dessus !" />
        ) : (
          <div className="space-y-1">
            {accepted.map(f => (
              <div key={f.friend_id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors group">
                <Avatar emoji={f.avatar_emoji} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{f.display_name || f.username}</p>
                  <p className="text-xs text-slate-400">@{f.username}</p>
                </div>
                <button
                  onClick={() => removeFriend(f.friend_id, false)}
                  disabled={pendingActions.has(f.friend_id)}
                  className="text-xs text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-lg opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {outgoing.length > 0 && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/60 p-4 space-y-2">
          <SectionTitle count={outgoing.length} color="slate">📤 Demandes envoyées</SectionTitle>
          {outgoing.map(f => (
            <div key={f.friend_id} className="flex items-center gap-3 px-2 py-1.5">
              <Avatar emoji={f.avatar_emoji} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-600 truncate">{f.display_name || f.username}</p>
                <p className="text-xs text-slate-400">@{f.username}</p>
              </div>
              <span className="text-xs text-amber-600 font-medium">En attente…</span>
              <button
                onClick={() => removeFriend(f.friend_id, true)}
                disabled={pendingActions.has(f.friend_id)}
                className="text-xs text-slate-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
                title="Annuler"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Carte de défi
// ----------------------------------------------------------------
interface ChallengeCardProps {
  c: ChallengeEntry;
  pendingActions: Set<string>;
  onRespond: (id: string, action: string) => () => Promise<void>;
}

function ChallengeCard({ c, pendingActions, onRespond }: ChallengeCardProps) {
  const opponent =
    c.role === "challenger"
      ? { name: c.challenged_display || c.challenged_username, emoji: c.challenged_emoji }
      : { name: c.challenger_display || c.challenger_username, emoji: c.challenger_emoji };
  const myScore = c.role === "challenger" ? c.challenger_score : c.challenged_score;
  const oppScore = c.role === "challenger" ? c.challenged_score : c.challenger_score;
  const gameLink = GAME_LINKS[c.game_type];
  const gameLabel = (GAME_LABELS[c.game_type] || c.game_type).replace(/^[^\s]+ /, "");

  const resultColor =
    myScore !== null && oppScore !== null
      ? myScore > oppScore ? "text-green-600" : myScore < oppScore ? "text-red-600" : "text-slate-500"
      : "text-slate-500";
  const resultLabel =
    myScore !== null && oppScore !== null
      ? myScore > oppScore ? "🏆 Gagné !" : myScore < oppScore ? "😞 Perdu" : "🤝 Égalité"
      : "";

  const cardBg: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50/60",
    accepted: "border-green-200 bg-green-50/60",
    completed: "border-blue-200 bg-blue-50/40",
    declined: "border-slate-200 bg-slate-50/60",
    expired:  "border-slate-200 bg-slate-50/40",
  };

  return (
    <div className={`rounded-2xl border p-3 transition-colors ${cardBg[c.status] ?? "border-slate-200 bg-white/80"}`}>
      <div className="flex items-start gap-3">
        <Avatar emoji={opponent.emoji} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{opponent.name}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-xs text-slate-500">{gameLabel}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {c.role === "challenger" && c.status !== "completed" && (
              <span className="text-[10px] font-medium text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded-full">Tu as lancé</span>
            )}
            {c.role === "challenged" && c.status === "pending" && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">🔔 Invitation reçue</span>
            )}
            {c.status === "completed" && (
              <>
                <span className={`text-xs font-bold ${resultColor}`}>{resultLabel}</span>
                <span className="text-xs text-slate-400">{myScore ?? "—"} vs {oppScore ?? "—"}</span>
              </>
            )}
            {c.status === "declined" && <span className="text-xs text-slate-400">Refusé</span>}
            {c.status === "expired"  && <span className="text-xs text-slate-400">Expiré</span>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
          {c.status === "pending" && c.role === "challenged" && (
            <>
              <button
                onClick={onRespond(c.id, "accept")}
                disabled={pendingActions.has(c.id)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {pendingActions.has(c.id) ? <Spinner /> : "✓"} OK
              </button>
              <button
                onClick={onRespond(c.id, "decline")}
                disabled={pendingActions.has(c.id)}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-600 font-semibold hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </>
          )}
          {c.status === "accepted" && gameLink && (
            <Link
              href={gameLink}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
            >
              ▶ Jouer
            </Link>
          )}
          {c.status === "pending" && c.role === "challenger" && (
            <span className="text-xs text-amber-600 font-medium self-center">En attente…</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Onglet Défis
// ----------------------------------------------------------------
function ChallengesTab({ toast }: { toast: (msg: string, type?: ToastType) => void }) {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeEntry[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGame, setNewGame] = useState("speed_match");
  const [newFriendId, setNewFriendId] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, fRes] = await Promise.all([
        fetch("/api/challenges"),
        fetch("/api/friends"),
      ]);
      if (cRes.status === 401 || fRes.status === 401) { router.replace("/login"); return; }
      if (!cRes.ok) throw new Error(`challenges ${cRes.status}`);
      if (!fRes.ok) throw new Error(`friends ${fRes.status}`);
      setChallenges(await cRes.json());
      const all: FriendEntry[] = await fRes.json();
      setFriends(all.filter(f => f.status === "accepted"));
    } catch {
      setError("Impossible de charger les défis.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const createChallenge = async () => {
    if (!newFriendId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengedId: newFriendId, gameType: newGame }),
      });
      if (res.ok) {
        toast("Défi envoyé !", "success");
        setShowCreate(false);
        setNewFriendId("");
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error === "Can only challenge friends" ? "Tu dois d'abord être ami avec ce joueur" : "Impossible d'envoyer le défi", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const respondChallenge = (id: string, action: string) => async () => {
    setPendingActions(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast(action === "accept" ? "Défi accepté !" : "Défi refusé", action === "accept" ? "success" : "info");
        await load();
      } else {
        toast("Action impossible", "error");
      }
    } finally {
      setPendingActions(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const pending = challenges.filter(c => c.status === "pending");
  const active  = challenges.filter(c => c.status === "accepted");
  const done    = challenges.filter(c => ["completed", "declined", "expired"].includes(c.status));

  return (
    <div className="space-y-4">
      <div className="bg-white/80 rounded-2xl border border-slate-200/70 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">⚔️ Lancer un défi</h3>
          <button
            onClick={() => setShowCreate(v => !v)}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              showCreate ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {showCreate ? "Annuler" : "+ Nouveau défi"}
          </button>
        </div>
        {showCreate && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-2">Défier</label>
              {friends.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                  <span>⚠️</span>
                  <p className="text-xs text-amber-700">Ajoute des amis d&apos;abord depuis l&apos;onglet Amis !</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {friends.map(f => (
                    <button
                      key={f.friend_id}
                      onClick={() => setNewFriendId(f.friend_id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors ${
                        newFriendId === f.friend_id
                          ? "border-indigo-400 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40"
                      }`}
                    >
                      <Avatar emoji={f.avatar_emoji} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{f.display_name || f.username}</p>
                        <p className="text-[10px] text-slate-400 truncate">@{f.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-2">Jeu</label>
              <div className="grid grid-cols-1 gap-1.5">
                {Object.entries(GAME_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNewGame(key)}
                    className={`text-sm px-3 py-2.5 rounded-xl font-medium transition-colors text-left ${
                      newGame === key ? "bg-indigo-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={createChallenge}
              disabled={!newFriendId || creating || friends.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {creating ? <><Spinner /> Envoi en cours…</> : "⚔️ Envoyer le défi"}
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={load} className="text-xs text-indigo-500 hover:underline">Réessayer</button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <SectionTitle count={pending.length} color="amber">🕐 En attente</SectionTitle>
              {pending.map(c => <ChallengeCard key={c.id} c={c} pendingActions={pendingActions} onRespond={respondChallenge} />)}
            </div>
          )}
          {active.length > 0 && (
            <div className="space-y-2">
              <SectionTitle count={active.length} color="green">🎮 Défis actifs</SectionTitle>
              {active.map(c => <ChallengeCard key={c.id} c={c} pendingActions={pendingActions} onRespond={respondChallenge} />)}
            </div>
          )}
          {pending.length === 0 && active.length === 0 && done.length === 0 && (
            <EmptyState icon="⚔️" title="Aucun défi pour l'instant" sub="Lance un défi à un ami !" />
          )}
          {done.length > 0 && (
            <div className="space-y-2">
              <SectionTitle count={done.length} color="slate">📜 Historique</SectionTitle>
              {done.slice(0, 10).map(c => <ChallengeCard key={c.id} c={c} pendingActions={pendingActions} onRespond={respondChallenge} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Page principale
// ----------------------------------------------------------------
export default function SocialPage() {
  const [tab, setTab] = useState<"friends" | "challenges">("friends");
  const { toasts, show: showToast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-200/60 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-amber-100 hover:bg-amber-200 transition-colors flex-shrink-0"
          >
            <img src="/sprites/logo_maison.png" alt="Accueil" className="w-full h-full object-cover" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-indigo-900 leading-tight">Social</h1>
            <p className="text-[11px] text-indigo-400">Amis · Défis · Compétition</p>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 flex border-t border-indigo-100/60">
          {([["friends", "👥 Amis"], ["challenges", "⚔️ Défis"]] as ["friends" | "challenges", string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === key ? "border-indigo-500 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-5">
        {tab === "friends" ? <FriendsTab toast={showToast} /> : <ChallengesTab toast={showToast} />}
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
