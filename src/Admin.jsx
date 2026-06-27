import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient.js";
import { useAuth } from "./AuthContext.jsx";
import Header from "./header.jsx";
import Rating from "@mui/material/Rating";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

function Admin() {
  const { user, loading } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [r, c] = await Promise.all([
      supabase.from("reviews").select().eq("status", "pending").order("created_at", { ascending: true }),
      supabase.from("courses").select().eq("status", "pending").order("created_at", { ascending: true }),
    ]);
    if (r.error || c.error) {
      setError("Could not load the moderation queue.");
    } else {
      setPendingReviews(r.data);
      setPendingCourses(c.data);
    }
    setDataLoaded(true);
  };

  useEffect(() => {
    if (user?.isAdmin) load();
  }, [user?.isAdmin]);

  const moderate = async (table, id, status, setList) => {
    setError("");
    const { error: updateError } = await supabase.from(table).update({ status }).eq("id", id);
    if (updateError) {
      setError("That action failed. Please try again.");
      return;
    }
    setList((prev) => prev.filter((row) => row.id !== id));
  };

  // Wait for auth — and the async is_admin lookup (undefined = unresolved) —
  // before deciding access, so a real admin isn't bounced mid-load.
  if (loading || (user && user.isAdmin === undefined)) {
    return <div style={{ padding: "2rem" }}>Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/home" replace />;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem" }}>
      <Header />
      <h1 className="mt-3" style={{ color: "var(--clr-navy)" }}>Moderation Queue</h1>
      <p style={{ color: "#777" }}>Approve or reject pending submissions. Approved items appear on the site immediately.</p>

      {error && <p style={{ color: "var(--clr-red)" }}>{error}</p>}
      {!dataLoaded && <p>Loading queue…</p>}

      {/* Pending courses */}
      <h2 className="mt-4">Courses {dataLoaded && <span style={{ color: "#aaa", fontSize: "1rem" }}>({pendingCourses.length})</span>}</h2>
      <hr />
      {dataLoaded && pendingCourses.length === 0 && (
        <p style={{ fontStyle: "italic", color: "#999" }}>No courses awaiting approval.</p>
      )}
      {pendingCourses.map((c) => (
        <div key={c.id} style={cardStyle}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{c.course} <span style={{ color: "var(--clr-red)", fontSize: "0.9rem" }}>· {c.school}</span></h3>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.4rem" }}>{c.faculty}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{c.description}</div>
          </div>
          <div style={btnColStyle}>
            <button style={approveBtn} onClick={() => moderate("courses", c.id, "approved", setPendingCourses)}>Approve</button>
            <button style={rejectBtn} onClick={() => moderate("courses", c.id, "rejected", setPendingCourses)}>Reject</button>
          </div>
        </div>
      ))}

      {/* Pending reviews */}
      <h2 className="mt-5">Reviews {dataLoaded && <span style={{ color: "#aaa", fontSize: "1rem" }}>({pendingReviews.length})</span>}</h2>
      <hr />
      {dataLoaded && pendingReviews.length === 0 && (
        <p style={{ fontStyle: "italic", color: "#999" }}>No reviews awaiting approval.</p>
      )}
      {pendingReviews.map((rev) => (
        <div key={rev.id} style={cardStyle}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.3rem" }}>
              {rev.school?.toUpperCase()} · {rev.course} · {rev.year}
              {rev.verified && <> · <VerifiedUserIcon sx={{ fontSize: "0.95rem", color: "var(--clr-navy)" }} /> Verified</>}
            </div>
            <Rating name="read-only" size="small" value={Number(rev.rate) || 0} readOnly />
            <div style={{ whiteSpace: "pre-wrap", marginTop: "0.3rem" }}>{rev.review}</div>
          </div>
          <div style={btnColStyle}>
            <button style={approveBtn} onClick={() => moderate("reviews", rev.id, "approved", setPendingReviews)}>Approve</button>
            <button style={rejectBtn} onClick={() => moderate("reviews", rev.id, "rejected", setPendingReviews)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  display: "flex",
  gap: "1rem",
  alignItems: "flex-start",
  border: "1px solid #e2e2e2",
  borderRadius: "8px",
  padding: "1rem",
  marginBottom: "0.75rem",
};

const btnColStyle = { display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "110px" };

const baseBtn = {
  padding: "0.5rem 0.75rem",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  color: "white",
};

const approveBtn = { ...baseBtn, background: "#2e7d32" };
const rejectBtn = { ...baseBtn, background: "var(--clr-red)" };

export default Admin;
