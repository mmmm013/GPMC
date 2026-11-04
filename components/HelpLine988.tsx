/**
 * The 988 help line, on every page.
 *
 * GD, 2026-11-04: songs like The Meltdown and The War carry a gentle help line
 * with the national mental-health hotline, "Especially. But have available &
 * seen for ALL!" It speaks to whoever is listening (User/Recipient), never
 * "send to a friend". Calm: no motion, no colour flash.
 */
const link = { color: "#f3d48a", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: 4 } as const;

export default function HelpLine988() {
  return (
    <aside
      aria-label="Help line"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.35)",
        color: "rgba(250,247,240,0.88)",
        textAlign: "center",
        padding: "16px 20px",
        fontSize: 16,
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0 }}>
        If a song feels close to home, you&rsquo;re not alone.{" "}
        <a style={link} href="tel:988">Call</a> or <a style={link} href="sms:988">text 988</a>, any time.
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.7 }}>
        Outside the US:{" "}
        <a style={{ color: "inherit", textDecoration: "underline" }} href="https://findahelpline.com" rel="noopener" target="_blank">
          findahelpline.com
        </a>
      </p>
    </aside>
  );
}
