export default function Header({ 
  sessionTime, 
  view, 
  setView
}: { 
  sessionTime: number, 
  view?: "terminal" | "table", 
  setView?: (view: "terminal" | "table") => void
}) {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <header style={{
      borderBottom: "1px solid var(--text-muted)",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      textTransform: "uppercase",
      letterSpacing: "2px",
      fontSize: "0.9rem"
    }}>
      <div>
        <span className="glitch" style={{ color: "var(--text-alert)", fontWeight: "bold" }}>SYBIL</span>
        <span style={{ color: "var(--text-muted)", margin: "0 10px" }}>//</span>
        <span>MEMORY INTEGRITY CHECK</span>
        <span style={{ color: "var(--text-muted)", margin: "0 10px" }}>//</span>
        <span>SESSION 01</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>

        {setView && (
          <button 
            onClick={() => setView(view === "terminal" ? "table" : "terminal")}
            style={{ 
              background: view === "terminal" ? "#33ff33" : "transparent", 
              color: view === "terminal" ? "#000" : "var(--text-amber)", 
              padding: "0.5rem 1rem", 
              border: view === "terminal" ? "none" : "1px solid var(--text-amber)", 
              cursor: "pointer", 
              fontWeight: "bold",
              fontFamily: "var(--font-mono)"
            }}
          >
            {view === "terminal" ? "GO TO DESK" : "RETURN TO TERMINAL"}
          </button>
        )}
        <div style={{ color: "var(--text-amber)" }}>
          T+ {formatTime(sessionTime)}
        </div>
      </div>
    </header>
  );
}
