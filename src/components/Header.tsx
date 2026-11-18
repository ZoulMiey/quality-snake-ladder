export default function Header({ small, children }: { small?: boolean; children?: React.ReactNode }) {
  return (
    <header className={`qm-header ${small ? "small" : ""}`}>
      <div className="qm-ribbon">Quality Month 2026</div>
      <div className="qm-title">
        <span className="t-en">Snake &amp; Ladder</span>
        <span className="t-ms">Ular &amp; Tangga</span>
      </div>
      {children && <div className="qm-tools">{children}</div>}
    </header>
  );
}
