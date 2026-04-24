import type { CSSProperties, ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div style={styles.page}>
      <div style={styles.backdrop} />
      <main style={styles.main}>
        {hasHeader ? (
          <header style={styles.header}>
            <div style={styles.headerTop}>
              {title ? <div style={styles.badge}>{title}</div> : null}
              {actions ? <div style={styles.actions}>{actions}</div> : null}
            </div>
            {subtitle ? <h1 style={styles.heading}>{subtitle}</h1> : null}
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 10%, rgba(180, 102, 63, 0.16), transparent 24%), radial-gradient(circle at 80% 0%, rgba(104, 139, 214, 0.16), transparent 22%)",
    pointerEvents: "none",
  },
  main: {
    position: "relative",
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "28px 24px 64px",
  },
  header: {
    display: "grid",
    gap: "10px",
    marginBottom: "16px",
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  badge: {
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.72)",
    border: "1px solid rgba(64, 47, 30, 0.08)",
    color: "#7a4a31",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
    boxShadow: "0 10px 40px rgba(91, 60, 36, 0.08)",
  },
  heading: {
    margin: 0,
    maxWidth: "760px",
    fontSize: "18px",
    lineHeight: 1.35,
    letterSpacing: "-0.02em",
    fontWeight: 700,
  },
};
