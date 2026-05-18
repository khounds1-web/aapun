import { useState } from "react";

const mockData = {
  userName: "Sumana",
  timeOfDay: "evening",
  currentConversation: {
    topic: "Balancing careers and parenting",
    matchName: "RJ",
    tags: ["identity", "ambition", "exhaustion"],
    matchId: "match-1",
  },
  suggestions: [
    { id: 1, initial: "M", name: "Maya", tag1: "Toddler mom", tag2: "Career & identity", color: "#6b5b9e" },
    { id: 2, initial: "E", name: "Elena", tag1: "6–12 month baby", tag2: "Feeding & sleep", color: "#c97a52" },
    { id: 3, initial: "P", name: "Priya", tag1: "Newborn mom", tag2: "Returning to work", color: "#7a9e8e" },
  ],
  resource: {
    title: "The Mom Hour",
    duration: "32 min",
    icon: "🎧",
  },
};

function getGreeting(time) {
  if (time === "morning") return "Good morning";
  if (time === "afternoon") return "Good afternoon";
  return "Good evening";
}

export default function AapunDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const { userName, timeOfDay, currentConversation, suggestions, resource } = mockData;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#f7f5f2",
      minHeight: "100vh",
      maxWidth: "430px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px 8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px",
            background: "linear-gradient(135deg, #9b8ec4 0%, #c97a52 100%)",
            borderRadius: "50%",
            opacity: 0.85,
          }} />
          <span style={{ fontSize: "17px", fontWeight: "600", color: "#1a1a2e", letterSpacing: "-0.3px" }}>aapun</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", color: "#4a4a6a",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: "#6b5b9e", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "600",
          }}>S</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 100px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: "24px", marginTop: "8px" }}>
          <h1 style={{
            fontSize: "30px", fontWeight: "700", color: "#1a1a2e",
            letterSpacing: "-0.8px", lineHeight: "1.2", margin: "0 0 6px",
          }}>
            {getGreeting(timeOfDay)},<br />{userName} 👋
          </h1>
          <p style={{ fontSize: "15px", color: "#7a7a9a", margin: 0, lineHeight: "1.5" }}>
            Meaningful conversations<br />beyond your everyday circle.
          </p>
        </div>

        {/* Current conversation card */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "28px",
          border: "0.5px solid rgba(107,91,158,0.12)",
          boxShadow: "0 2px 12px rgba(107,91,158,0.07)",
        }}>
          <p style={{
            fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em",
            color: "#6b5b9e", margin: "0 0 10px", textTransform: "uppercase",
          }}>Your current conversation</p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "#ede9f7", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#6b5b9e">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 3px", letterSpacing: "-0.3px" }}>
                {currentConversation.topic}
              </h2>
              <p style={{ fontSize: "14px", color: "#7a7a9a", margin: "0 0 14px" }}>
                You and {currentConversation.matchName}
              </p>
              <p style={{ fontSize: "12px", color: "#9a9ab8", margin: "0 0 10px" }}>You've been talking about:</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {currentConversation.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: "13px", color: "#4a4a6a",
                      background: "#f0edf8", borderRadius: "20px",
                      padding: "4px 12px", fontWeight: "400",
                    }}>{tag}</span>
                  ))}
                </div>
                <button style={{
                  background: "#6b5b9e", color: "white", border: "none",
                  borderRadius: "22px", padding: "10px 18px",
                  fontSize: "14px", fontWeight: "500", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px",
                  whiteSpace: "nowrap",
                }}>
                  Continue →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* People you may connect with */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "600", color: "#1a1a2e", margin: 0, letterSpacing: "-0.3px" }}>
              People you may connect with
            </h2>
            <button style={{
              background: "none", border: "none", fontSize: "13px",
              color: "#6b5b9e", cursor: "pointer", fontWeight: "500",
              display: "flex", alignItems: "center", gap: "3px", padding: 0,
            }}>See all →</button>
          </div>

          <div style={{
            background: "white", borderRadius: "20px",
            border: "0.5px solid rgba(107,91,158,0.1)",
            overflow: "hidden",
          }}>
            {suggestions.map((person, idx) => (
              <div key={person.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: idx < suggestions.length - 1 ? "0.5px solid #f0edf8" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: idx === 0 ? "#ede9f7" : idx === 1 ? "#f7ede6" : "#e8f0ec",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: "600",
                    color: idx === 0 ? "#6b5b9e" : idx === 1 ? "#c97a52" : "#4a8a6a",
                  }}>{person.initial}</div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "500", color: "#1a1a2e", margin: "0 0 2px" }}>{person.name}</p>
                    <p style={{ fontSize: "13px", color: "#9a9ab8", margin: 0 }}>
                      {person.tag1} · {person.tag2}
                    </p>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9ab8" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: resource + AI */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* Resource card */}
          <div style={{
            background: "white", borderRadius: "20px", padding: "16px",
            border: "0.5px solid rgba(201,122,82,0.15)",
          }}>
            <p style={{
              fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em",
              color: "#c97a52", margin: "0 0 10px", textTransform: "uppercase",
            }}>For tonight</p>
            <div style={{
              width: "36px", height: "36px", borderRadius: "12px",
              background: "#faf0e8", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", marginBottom: "10px",
            }}>🎧</div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 4px", lineHeight: "1.3" }}>
              {resource.title}
            </p>
            <p style={{ fontSize: "12px", color: "#9a9ab8", margin: "0 0 12px" }}>{resource.duration}</p>
            <button style={{
              background: "none", border: "none", padding: 0,
              fontSize: "13px", color: "#c97a52", fontWeight: "500", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "4px",
            }}>Listen →</button>
          </div>

          {/* AI reflection card */}
          <div style={{
            background: "#ede9f7", borderRadius: "20px", padding: "16px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "#6b5b9e", display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: "12px",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 4px", lineHeight: "1.3" }}>
                Reflect quietly<br />with Aapun AI
              </p>
              <button style={{
                background: "none", border: "none", padding: 0,
                fontSize: "13px", color: "#6b5b9e", fontWeight: "500", cursor: "pointer",
                marginTop: "10px", display: "flex", alignItems: "center", gap: "4px",
              }}>Begin →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: "430px",
        background: "white", borderTop: "0.5px solid #eeeaf4",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 20px",
        zIndex: 10,
      }}>
        {[
          { id: "home", label: "Home", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === "home" ? "#6b5b9e" : "none"} stroke={activeTab === "home" ? "#6b5b9e" : "#9a9ab8"} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { id: "spaces", label: "Spaces", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "spaces" ? "#6b5b9e" : "#9a9ab8"} strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: "reflections", label: "Reflections", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "reflections" ? "#6b5b9e" : "#9a9ab8"} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
          { id: "profile", label: "Profile", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activeTab === "profile" ? "#6b5b9e" : "#9a9ab8"} strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
            padding: "4px 16px",
          }}>
            {tab.icon}
            <span style={{
              fontSize: "11px", fontWeight: "500",
              color: activeTab === tab.id ? "#6b5b9e" : "#9a9ab8",
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}