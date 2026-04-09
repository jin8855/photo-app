import type { CSSProperties } from "react";

type HomeScreenProps = {
  messages: {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    structureTitle: string;
    structureDescription: string;
    structureItems: string[];
    readinessTitle: string;
    readinessDescription: string;
    readinessItems: string[];
    actionPrimary: string;
    actionSecondary: string;
    statusTitle: string;
    statusDescription: string;
  };
};

export function HomeScreen({ messages }: HomeScreenProps) {
  return (
    <section style={styles.layout}>
      <article style={{ ...styles.card, ...styles.heroCard }}>
        <div style={styles.eyebrow}>{messages.heroEyebrow}</div>
        <h2 style={styles.cardTitle}>{messages.heroTitle}</h2>
        <p style={styles.description}>{messages.heroDescription}</p>
        <div style={styles.actions}>
          <button style={{ ...styles.button, ...styles.primaryButton }} type="button">
            {messages.actionPrimary}
          </button>
          <button style={{ ...styles.button, ...styles.secondaryButton }} type="button">
            {messages.actionSecondary}
          </button>
        </div>
      </article>

      <article style={styles.card}>
        <h2 style={styles.cardTitle}>{messages.structureTitle}</h2>
        <p style={styles.description}>{messages.structureDescription}</p>
        <ul style={styles.list}>
          {messages.structureItems.map((item) => (
            <li key={item} style={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </article>

      <article style={styles.card}>
        <h2 style={styles.cardTitle}>{messages.readinessTitle}</h2>
        <p style={styles.description}>{messages.readinessDescription}</p>
        <ul style={styles.list}>
          {messages.readinessItems.map((item) => (
            <li key={item} style={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </article>

      <article style={{ ...styles.card, ...styles.statusCard }}>
        <h2 style={styles.cardTitle}>{messages.statusTitle}</h2>
        <p style={styles.description}>{messages.statusDescription}</p>
      </article>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  layout: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  },
  card: {
    padding: "28px",
    borderRadius: "28px",
    background: "rgba(255, 255, 255, 0.76)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    boxShadow: "0 20px 60px rgba(91, 60, 36, 0.1)",
    backdropFilter: "blur(14px)",
  },
  heroCard: {
    gridColumn: "span 2",
  },
  statusCard: {
    background:
      "linear-gradient(135deg, rgba(180, 102, 63, 0.14), rgba(104, 139, 214, 0.12)), rgba(255, 255, 255, 0.8)",
  },
  eyebrow: {
    display: "inline-flex",
    marginBottom: "18px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(180, 102, 63, 0.1)",
    color: "#8f4725",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  cardTitle: {
    margin: "0 0 12px",
    fontSize: "1.4rem",
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
  },
  description: {
    margin: 0,
    color: "#5f564d",
    lineHeight: 1.7,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },
  button: {
    borderRadius: "999px",
    border: "1px solid transparent",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    background: "#1f1b17",
    color: "#fffaf4",
  },
  secondaryButton: {
    background: "rgba(255, 255, 255, 0.82)",
    color: "#1f1b17",
    borderColor: "rgba(64, 47, 30, 0.12)",
  },
  list: {
    margin: "18px 0 0",
    padding: 0,
    listStyle: "none",
    display: "grid",
    gap: "10px",
  },
  listItem: {
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.65)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    color: "#2f2923",
  },
};
