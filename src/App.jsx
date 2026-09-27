import { useMemo, useState } from "react";
import {
  catalogedFileTotal,
  drives,
  formatCount,
  isBigGame,
  isStale,
  scanLabel,
  usedFraction,
  usedLabel,
} from "./drives.js";

const VIEWS = [
  { id: "drives", label: "Drives" },
  { id: "duplicates", label: "Duplicates" },
  { id: "big-game", label: "Big Game" },
  { id: "stale", label: "Stale" },
];

function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  if (name === "drives") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="6" rx="1.5" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01" />
      </svg>
    );
  }
  if (name === "duplicates") {
    return (
      <svg {...common}>
        <rect x="8" y="8" width="11" height="11" rx="1.5" />
        <path d="M6 16V6.5A1.5 1.5 0 0 1 7.5 5H16" />
      </svg>
    );
  }
  if (name === "big-game") {
    return (
      <svg {...common}>
        <path d="M4 18V8l4 3 4-6 4 6 4-3v10" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}

function primaryLine(drive) {
  if (drive.internal) return "Internal startup disk";
  const files = drive.files == null ? null : `${formatCount(drive.files)} files`;
  const folders = drive.folders == null ? null : `${formatCount(drive.folders)} folders`;
  const catalog =
    drive.catalogedLabel && drive.files != null
      ? `Cataloged: ${drive.catalogedLabel} (${formatCount(drive.files)} files)`
      : null;
  return [files, folders, catalog].filter(Boolean).join(" · ");
}

function secondaryLine(drive) {
  if (drive.internal && drive.freeLabel && drive.capacityLabel) {
    const used = usedLabel(drive);
    return [`Free ${drive.freeLabel} of ${drive.capacityLabel}`, used].filter(Boolean).join(" · ");
  }
  if (drive.usageKnown && drive.freeLabel && drive.capacityLabel) {
    return `Free ${drive.freeLabel} of ${drive.capacityLabel} · as of last scan`;
  }
  if (!drive.usageKnown && drive.capacityLabel) {
    return `${drive.capacityLabel} capacity · usage unknown — connect to refresh`;
  }
  return "No capacity recorded";
}

function DriveCard({ drive, selected, onSelect }) {
  const fraction = usedFraction(drive);
  const percent = fraction == null ? null : Math.round(fraction * 1000) / 10;
  const meterLabel =
    drive.freeLabel && drive.capacityLabel
      ? `${drive.freeLabel} available of ${drive.capacityLabel}`
      : `${drive.name} storage`;

  return (
    <article
      id={`drive-${drive.id}`}
      className={`card tone-${drive.tone}${selected ? " is-selected" : ""}`}
      onClick={onSelect}
    >
      <header className="card-head">
        <span className={`dot tone-${drive.tone}`} />
        <h2>{drive.name}</h2>
        {drive.internal ? <span className="chip">Internal · {drive.capacityLabel}</span> : null}
      </header>
      <div
        className={`meter${fraction == null ? " is-empty" : ""}${drive.usageKnown ? "" : " is-catalog"}`}
        role="meter"
        aria-label={meterLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? 0}
        aria-valuetext={meterLabel}
      >
        <span style={{ width: fraction == null ? "0%" : `${fraction * 100}%` }} />
      </div>
      <p className="meta">{primaryLine(drive)}</p>
      <p className="meta">{secondaryLine(drive)}</p>
      <p className="scan">{scanLabel(drive)}</p>
    </article>
  );
}

export default function App() {
  const [view, setView] = useState("drives");
  const [selectedId, setSelectedId] = useState("macintosh-hd");

  const visible = useMemo(() => {
    if (view === "stale") return drives.filter(isStale);
    if (view === "big-game") return drives.filter(isBigGame);
    if (view === "duplicates") return [];
    return drives;
  }, [view]);

  const fileTotal = catalogedFileTotal();

  function selectDrive(id) {
    setView("drives");
    setSelectedId(id);
    requestAnimationFrame(() => {
      document.getElementById(`drive-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h.01M3 13h18" />
            </svg>
          </span>
          <span>DriveVault</span>
        </div>

        <nav className="nav" aria-label="Library">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? "is-active" : ""}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              <Icon name={item.id} />
              {item.label}
            </button>
          ))}
        </nav>

        <ul className="drive-list">
          {drives.map((drive) => (
            <li key={drive.id}>
              <button
                type="button"
                className={selectedId === drive.id && view === "drives" ? "is-active" : ""}
                onClick={() => selectDrive(drive.id)}
              >
                <span className={`dot tone-${drive.tone}`} />
                <span className="drive-name">{drive.name}</span>
                {drive.capacityLabel ? <span className="drive-size">{drive.capacityLabel}</span> : null}
              </button>
            </li>
          ))}
        </ul>

        <footer className="sidebar-foot">
          {formatCount(drives.length)} drives · {formatCount(fileTotal)} files
        </footer>
      </aside>

      <main className="main">
        {view === "duplicates" ? (
          <section className="empty">
            <h1>Duplicates</h1>
            <p>No duplicate groups in the catalog. Connect a drive and scan again to compare files.</p>
          </section>
        ) : (
          <>
            {view !== "drives" ? (
              <header className="view-head">
                <h1>{VIEWS.find((item) => item.id === view)?.label}</h1>
                <p>
                  {view === "big-game"
                    ? "Volumes of 1 TB and larger, including this Mac."
                    : "Volumes that have not been scanned in the last 30 days."}
                </p>
              </header>
            ) : null}
            <section className="grid" aria-label="Drives">
              {visible.map((drive) => (
                <DriveCard
                  key={drive.id}
                  drive={drive}
                  selected={selectedId === drive.id}
                  onSelect={() => setSelectedId(drive.id)}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
