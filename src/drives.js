const TB = 1e12;
const GB = 1e9;
const MB = 1e6;

/**
 * Volumes from the DriveVault catalog, plus this Mac's internal disk.
 * File totals for the nine external volumes add up to 54,149.
 * Macintosh HD is connected now and is not part of that catalog count.
 */
export const drives = [
  {
    id: "macintosh-hd",
    name: "Macintosh HD",
    tone: "steel",
    internal: true,
    files: null,
    folders: null,
    catalogedBytes: null,
    capacityBytes: 8 * TB,
    capacityLabel: "8 TB",
    freeBytes: 215.46 * GB,
    freeLabel: "215.46 GB",
    usageKnown: true,
    lastScannedDays: null,
    connected: true,
  },
  {
    id: "black-magic-1tb",
    name: "Black Magic 1TB",
    tone: "green",
    files: 285,
    folders: 4,
    catalogedBytes: 748 * GB,
    catalogedLabel: "748 GB",
    capacityBytes: 1.02 * TB,
    capacityLabel: "1.02 TB",
    freeBytes: 221 * GB,
    freeLabel: "221 GB",
    usageKnown: true,
    lastScannedDays: 29,
  },
  {
    id: "duet-display",
    name: "Duet Display",
    tone: "neutral",
    files: 0,
    folders: 0,
    catalogedBytes: 0,
    catalogedLabel: "0 MB",
    capacityBytes: 458 * MB,
    capacityLabel: "458 MB",
    freeBytes: 164 * MB,
    freeLabel: "164 MB",
    usageKnown: true,
    lastScannedDays: null,
  },
  {
    id: "hodl",
    name: "HODL",
    tone: "purple",
    files: 5840,
    folders: 1138,
    catalogedBytes: 445 * GB,
    catalogedLabel: "445 GB",
    capacityBytes: 4 * TB,
    capacityLabel: "4.00 TB",
    freeBytes: 3.52 * TB,
    freeLabel: "3.52 TB",
    usageKnown: true,
    lastScannedDays: 58,
  },
  {
    id: "lacie",
    name: "LaCie",
    tone: "neutral",
    files: 46594,
    folders: 5823,
    catalogedBytes: 1.5 * TB,
    catalogedLabel: "1.5 TB",
    capacityBytes: 5 * TB,
    capacityLabel: "5.00 TB",
    freeBytes: null,
    freeLabel: null,
    usageKnown: false,
    lastScannedDays: 58,
  },
  {
    id: "muse-installer",
    name: "Muse Installer",
    tone: "neutral",
    files: 0,
    folders: 0,
    catalogedBytes: null,
    catalogedLabel: null,
    capacityBytes: null,
    capacityLabel: null,
    freeBytes: null,
    freeLabel: null,
    usageKnown: false,
    lastScannedDays: null,
  },
  {
    id: "ninjav",
    name: "NINJAV",
    tone: "indigo",
    files: 605,
    folders: 6,
    catalogedBytes: 931 * GB,
    catalogedLabel: "931 GB",
    capacityBytes: 1 * TB,
    capacityLabel: "1.00 TB",
    freeBytes: null,
    freeLabel: null,
    usageKnown: false,
    lastScannedDays: 58,
  },
  {
    id: "no-name",
    name: "NO NAME",
    tone: "neutral",
    files: 189,
    folders: 16,
    catalogedBytes: 5.6 * GB,
    catalogedLabel: "5.6 GB",
    capacityBytes: 31.3 * GB,
    capacityLabel: "31.3 GB",
    freeBytes: 25.3 * GB,
    freeLabel: "25.3 GB",
    usageKnown: true,
    lastScannedDays: 17,
  },
  {
    id: "sd-card",
    name: "SD_Card",
    tone: "neutral",
    files: 91,
    folders: 6,
    catalogedBytes: 53 * GB,
    catalogedLabel: "53 GB",
    capacityBytes: 62.2 * GB,
    capacityLabel: "62.2 GB",
    freeBytes: 4.92 * GB,
    freeLabel: "4.92 GB",
    usageKnown: true,
    lastScannedDays: 27,
  },
  {
    id: "skool-4tb",
    name: "Skool 4TB",
    tone: "gold",
    files: 545,
    folders: null,
    catalogedBytes: null,
    catalogedLabel: null,
    capacityBytes: 4 * TB,
    capacityLabel: "4 TB",
    freeBytes: null,
    freeLabel: null,
    usageKnown: false,
    lastScannedDays: null,
  },
];

export function usedFraction(drive) {
  if (drive.capacityBytes && drive.freeBytes != null && drive.usageKnown) {
    return Math.min(1, Math.max(0, 1 - drive.freeBytes / drive.capacityBytes));
  }
  if (drive.capacityBytes && drive.catalogedBytes != null && !drive.usageKnown) {
    return Math.min(1, Math.max(0, drive.catalogedBytes / drive.capacityBytes));
  }
  return null;
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function scanLabel(drive) {
  if (drive.connected && drive.internal) return "Connected now";
  if (drive.lastScannedDays == null) return "Last scanned never";
  return `Last scanned ${drive.lastScannedDays}d ago`;
}

export function isStale(drive) {
  if (drive.internal && drive.connected) return false;
  if (drive.lastScannedDays == null) return true;
  return drive.lastScannedDays >= 30;
}

export function isBigGame(drive) {
  return drive.capacityBytes != null && drive.capacityBytes >= TB;
}

export function catalogedFileTotal(list = drives) {
  return list.reduce((sum, drive) => sum + (drive.files ?? 0), 0);
}

export function usedLabel(drive) {
  if (!drive.usageKnown || drive.freeBytes == null || !drive.capacityBytes) return null;
  const used = drive.capacityBytes - drive.freeBytes;
  if (used >= TB) return `${(used / TB).toFixed(2)} TB used`;
  if (used >= GB) return `${(used / GB).toFixed(used >= 10 * GB ? 1 : 2)} GB used`;
  return `${Math.round(used / MB)} MB used`;
}
