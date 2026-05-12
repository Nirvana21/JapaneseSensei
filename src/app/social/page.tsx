"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
  speed_match: "Speed Match",
  kana_rain: "Kana Rain",
  memory: "Mémory",
  sens_cache: "Sens Caché",
  fill_blank: "Histoire à trous",
};

const GAME_LINKS: Record<string, string> = {
  speed_match: "/game/speed-match",
  kana_rain: "/game/kana-rain",
  memory: "/game/memory",
  sens_cache: "/game/sens-cache",
  fill_blank: "/game/histoire-a-trous",
};

// ----------------------------------------------------------------
// Composants utilitaires
// ----------------------------------------------------------------
function Avatar({ emoji, size = "md" }: { emoji: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-lg" : size === "lg" ? "w-12 h-12 text-2xl" : "w-10 h-10 text-xl";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0`}>
      {emoji || "🎌"}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    expired: "bg-slate-100 text-slate-500",
  };
  const labels: Record<string, string> = {
    pending: "En attente",
    accepted: "Accepté",
    declined: "Refusé",
    completed: "Terminé",
    expired: "Expiré",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[status] ?? "bg-slate-100 text-slate-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ----------------------------------------------------------------
// Onglet Amis
// ----------------------------------------------------------------
function FriendsTab() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const loadFriends = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/friends");
    if (res.ok) setFriends(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadFriends(); }, [loadFriends]);

  // Recherche avec debounce
  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`);
      if (res.ok) setResults(await res.json());
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const sendRequest = async (friendId: string) => {
    setPendingActions(prev => new Set(prev).add(friendId));
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    });
    if (res.ok) {
      setSearch("");
      setResults([]);
      await loadFriends();
    }
    setPendingActions(prev => { const s = new Set(prev); s.delete(friendId); return s; });
  };

  const respondToRequest = async (requesterId: string, action: "accept" | "decline") => {
    setPendingActions(prev => new Set(prev).add(requesterId));
    const res = await fetch(`/api/friends/${requesterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) await loadFriends();
    setPendingActions(prev => { const s = new Set(prev); s.delete(requesterId); return s; });
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm("Supprimer cet ami ?")) return;
    await fetch(`/api/friends/${friendId}`, { method: "DELETE" });
    await loadFriends();
  };

  const accepted = friends.filter(f => f.status === "accepted");
  const incoming = friends.filter(f => f.status === "pending" && f.direction === "received");
  const outgoing = friends.filter(f => f.status === "pending" && f.direction === "sent");

  // Savoir si un user est déjà dans la liste
  const friendIds = new Set(friends.map(f => f.friend_id));

  return (
    <div className="space-y-5">
      {/* Rechercher */}
      <div className="bg-white/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-700">Trouver un joueur</h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nom d'utilisateur..."
            className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-colors"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(u => {
              const alreadyFriend = friendIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors">
                  <Avatar emoji={u.avatar_emoji} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{u.display_name || u.username}</p>
                    <p className="text-xs text-slate-400">@{u.username}</p>
                  </div>
                  {alreadyFriend ? (
                    <span className="text-xs text-slate-400">Déjà ami</span>
                  ) : (
                    <button
                      onClick={() => sendRequest(u.id)}
                      disabled={pendingActions.has(u.id)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {search.length >= 2 && !searching && results.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Aucun joueur trouvé</p>
        )}
      </div>

      {/* Demandes reçues */}
      {incoming.length > 0 && (
        <div className="bg-amber-50/80 rounded-2xl border border-amber-200/80 p-4 space-y-3">
          <h3 className="text-sm font-bold text-amber-800">
            Demandes reçues ({incoming.length})
          </h3>
          {incoming.map(f => (
            <div key={f.friend_id} className="flex items-center gap-3">
              <Avatar emoji={f.avatar_emoji} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{f.display_name || f.username}</p>
                <p className="text-xs text-slate-400">@{f.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => respondToRequest(f.friend_id, "accept")}
                  disabled={pendingActions.has(f.friend_id)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  Accepter
                </button>
                <button
                  onClick={() => respondToRequest(f.friend_id, "decline")}
                  disabled={pendingActions.has(f.friend_id)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Amis */}
      <div className="bg-white/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-700">
          Mes amis ({accepted.length})
        </h3>
        {loading ? (
          <div className="text-center py-4 text-slate-400 text-sm">Chargement...</div>
        ) : accepted.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Aucun ami pour l&apos;instant — recherche des joueurs ci-dessus !
          </p>
        ) : (
          accepted.map(f => (
            <div key={f.friend_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Avatar emoji={f.avatar_emoji} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{f.display_name || f.username}</p>
                <p className="text-xs text-slate-400">@{f.username}</p>
              </div>
              <button
                onClick={() => removeFriend(f.friend_id)}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Demandes envoyées */}
      {outgoing.length > 0 && (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-500">
            Demandes envoyées ({outgoing.length})
          </h3>
          {outgoing.map(f => (
            <div key={f.friend_id} className="flex items-center gap-3 p-2">
              <Avatar emoji={f.avatar_emoji} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{f.display_name || f.username}</p>
                <p className="text-xs text-slate-400">@{f.username}</p>
              </div>
              <span className="text-xs text-amber-600 font-medium">En attente</span>
              <button
                onClick={() => removeFriend(f.friend_id)}
                className="text-xs text-slate-300 hover:text-red-400 transition-colors p-1"
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
// Onglet Défis
// ----------------------------------------------------------------
function ChallengesTab() {
  const [challenges, setChallenges] = useState<ChallengeEntry[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGame, setNewGame] = useState("speed_match");
  const [newFriendId, setNewFriendId] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, fRes] = await Promise.all([
      fetch("/api/challenges"),
      fetch("/api/friends"),
    ]);
    if (cRes.ok) setChallenges(await cRes.json());
    if (fRes.ok) {
      const all: FriendEntry[] = await fRes.json();
      setFriends(all.filter(f => f.status === "accepted"));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createChallenge = async () => {
    if (!newFriendId) return;
    setCreating(true);
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengedId: newFriendId, gameType: newGame }),
    });
    if (res.ok) {
      setShowCreate(false);
      await load();
    }
    setCreating(false);
  };

  const respondChallenge = async (id: string, action: string) => {
    setPendingActions(prev => new Set(prev).add(id));
    await fetch(`/api/challenges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
    setPendingActions(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const pending = challenges.filter(c => c.status === "pending");
  const active = challenges.filter(c => c.status === "accepted");
  const done = challenges.filter(c => ["completed", "declined", "expired"].includes(c.status));

  const ChallengeCard = ({ c }: { c: ChallengeEntry }) => {
    const opponent = c.role === "challenger"
      ? { name: c.challenged_display || c.challenged_username, emoji: c.challenged_emoji }
      : { name: c.challenger_display || c.challenger_username, emoji: c.challenger_emoji };
    const myScore = c.role === "challenger" ? c.challenger_score : c.challenged_score;
    const oppScore = c.role === "challenger" ? c.challenged_score : c.challenger_score;
    const gameLink = GAME_LINKS[c.game_type];

    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-indigo-50/50 transition-colors">
        <Avatar emoji={opponent.emoji} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{opponent.name}</span>
            <StatusBadge status={c.status} />
            <span className="text-xs text-slate-400">{GAME_LABELS[c.game_type] || c.game_type}</span>
          </div>
          {c.status === "completed" && (
            <p className="text-xs text-slate-500 mt-0.5">
              Toi: <strong>{myScore ?? "—"}</strong>  ·  Eux: <strong>{oppScore ?? "—"}</strong>
              {myScore !== null && oppScore !== null && (
                <span className={`ml-2 font-bold ${myScore > oppScore ? "text-green-600" : myScore < oppScore ? "text-red-600" : "text-slate-500"}`}>
                  {myScore > oppScore ? "Gagné !" : myScore < oppScore ? "Perdu" : "Égalité"}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {c.status === "pending" && c.role === "challenged" && (
            <>
              <button
                onClick={() => respondChallenge(c.id, "accept")}
                disabled={pendingActions.has(c.id)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Accepter
              </button>
              <button
                onClick={() => respondChallenge(c.id, "decline")}
                disabled={pendingActions.has(c.id)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-600 font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Refuser
              </button>
            </>
          )}
          {c.status === "accepted" && gameLink && (
            <Link
              href={gameLink}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
            >
              Jouer
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Créer un défi */}
      <div className="bg-white/80 rounded-2xl border border-slate-200/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">Lancer un défi</h3>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="text-xs px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            {showCreate ? "Annuler" : "+ Nouveau défi"}
          </button>
        </div>

        {showCreate && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Ami</label>
              <select
                value={newFriendId}
                onChange={e => setNewFriendId(e.target.value)}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400"
              >
                <option value="">Choisir un ami...</option>
                {friends.map(f => (
                  <option key={f.friend_id} value={f.friend_id}>
                    {f.display_name || f.username}
                  </option>
                ))}
              </select>
              {friends.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">Ajoute des amis d&apos;abord !</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Jeu</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(GAME_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNewGame(key)}
                    className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors text-left ${
                      newGame === key
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-indigo-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={createChallenge}
              disabled={!newFriendId || creating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {creating ? "Envoi..." : "Envoyer le défi"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-6 text-slate-400 text-sm">Chargement...</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide px-1">En attente ({pending.length})</h3>
              {pending.map(c => <ChallengeCard key={c.id} c={c} />)}
            </div>
          )}
          {active.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-green-700 uppercase tracking-wide px-1">Défis actifs ({active.length})</h3>
              {active.map(c => <ChallengeCard key={c.id} c={c} />)}
            </div>
          )}
          {pending.length === 0 && active.length === 0 && done.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              Aucun défi pour l&apos;instant.<br />Lance un défi à un ami !
            </p>
          )}
          {done.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Historique</h3>
              {done.slice(0, 5).map(c => <ChallengeCard key={c.id} c={c} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Page principale
// ----------------------------------------------------------------
export default function SocialPage() {
  const [tab, setTab] = useState<"friends" | "challenges">("friends");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
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
            <p className="text-[11px] text-indigo-500">Amis · Défis · Classements</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="max-w-lg mx-auto px-4 pb-0 flex">
          {([
            ["friends", "Amis"],
            ["challenges", "Défis"],
          ] as ["friends" | "challenges", string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === key
                  ? "border-indigo-500 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {tab === "friends" ? <FriendsTab /> : <ChallengesTab />}
      </main>
    </div>
  );
}
