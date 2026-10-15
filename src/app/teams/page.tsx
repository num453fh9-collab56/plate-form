"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { getSupabase } from "@/lib/supabase";

interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  invited_email: string;
  status: string;
  profiles?: { display_name: string };
}

async function getToken(): Promise<string | null> {
  const s = getSupabase();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function TeamsPage() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [teams, setTeams] = useState<{ owned: Team[]; member: Team[] }>({ owned: [], member: [] });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/teams", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTeams(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const createTeam = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    const token = await getToken();
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "create", name: newName.trim(), description: newDesc.trim() }),
    });
    if (res.ok) { toast("Team created!"); setNewName(""); setNewDesc(""); setCreating(false); void load(); }
    else { const j = await res.json(); toast(j.error || "Failed"); }
    setBusy(false);
  };

  const viewTeam = async (teamId: string) => {
    setActiveTeam(teamId);
    const token = await getToken();
    const res = await fetch(`/api/teams?teamId=${teamId}`, { headers: { Authorization: `Bearer ${token ?? ""}` } });
    if (res.ok) { const j = await res.json(); setMembers(j.members ?? []); }
  };

  const invite = async () => {
    if (!inviteEmail.trim() || !activeTeam) return;
    setBusy(true);
    const token = await getToken();
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "invite", teamId: activeTeam, email: inviteEmail.trim() }),
    });
    if (res.ok) { toast("Invite sent!"); setInviteEmail(""); void viewTeam(activeTeam); }
    else { const j = await res.json(); toast(j.error || "Failed"); }
    setBusy(false);
  };

  const removeMember = async (memberId: string) => {
    if (!activeTeam) return;
    const token = await getToken();
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ action: "remove", teamId: activeTeam, memberId }),
    });
    toast("Member removed.");
    void viewTeam(activeTeam);
  };

  if (!user?.sub) return <main className="container py-lg"><h1>Teams</h1><p className="muted">Please sign in to manage your teams.</p></main>;
  if (loading) return <main className="container py-lg"><p>Loading...</p></main>;

  const allTeams = [...teams.owned, ...teams.member];
  const selectedTeam = allTeams.find((t) => t.id === activeTeam);
  const isOwner = selectedTeam?.owner_id === user.sub;

  return (
    <main className="container py-lg" style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Teams</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>Create agency teams and collaborate with other freelancers</p>
        </div>
        {!creating ? (
          <button className="btn-primary btn-sm" onClick={() => setCreating(true)}>Create Team</button>
        ) : null}
      </div>

      {creating ? (
        <section className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px" }}>New Team</h3>
          <input
            type="text" placeholder="Team name" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", marginBottom: 10 }}
          />
          <textarea
            placeholder="Description (optional)" value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", minHeight: 60, resize: "vertical", marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary btn-sm" onClick={() => void createTeam()} disabled={busy}>{busy ? "Creating..." : "Create"}</button>
            <button className="btn-ghost btn-sm" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </section>
      ) : null}

      {activeTeam && selectedTeam ? (
        <section className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>{selectedTeam.name}</h3>
            <button className="btn-ghost btn-sm" onClick={() => setActiveTeam(null)}>Close</button>
          </div>
          {selectedTeam.description ? <p className="muted" style={{ marginBottom: 16 }}>{selectedTeam.description}</p> : null}

          <h4 style={{ margin: "0 0 12px" }}>Members ({members.length})</h4>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <span style={{ fontWeight: 600 }}>{(m.profiles as { display_name: string } | undefined)?.display_name || m.invited_email || "User"}</span>
                <span className="badge" style={{ marginLeft: 8 }}>{m.role}</span>
                <span className={`badge badge-${m.status === "active" ? "green" : "yellow"}`} style={{ marginLeft: 4 }}>{m.status}</span>
              </div>
              {isOwner && m.user_id !== user.sub ? (
                <button className="btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => void removeMember(m.id)}>Remove</button>
              ) : null}
            </div>
          ))}

          {isOwner ? (
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <input type="email" placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)" }} />
              <button className="btn-primary btn-sm" onClick={() => void invite()} disabled={busy}>Invite</button>
            </div>
          ) : null}
        </section>
      ) : null}

      {allTeams.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="muted">No teams yet. Create one to start collaborating!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {allTeams.map((t) => (
            <div key={t.id} className="card" style={{ padding: 16, cursor: "pointer" }} onClick={() => void viewTeam(t.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{t.name}</h3>
                  {t.description ? <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>{t.description}</p> : null}
                </div>
                <span className={`badge badge-${t.owner_id === user.sub ? "blue" : "green"}`}>
                  {t.owner_id === user.sub ? "Owner" : "Member"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
