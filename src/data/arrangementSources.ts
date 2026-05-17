import type {
  ArrangementCreationMetadata,
  ArrangementItem,
  ArrangementRelatedSource,
  ArrangementSourceType,
} from "@/data/arrangements";

export function createRelatedSource(
  metadata: ArrangementCreationMetadata,
  timestamp: number
): ArrangementRelatedSource | undefined {
  const sourceText = metadata.sourceText.trim();
  if (!sourceText) return undefined;

  return {
    id: buildSourceId(metadata.sourceRecordUid, sourceText, metadata.sourceSentAt),
    sourceText,
    sourceType: metadata.sourceType,
    sourceLabel: metadata.sourceLabel?.trim(),
    sourceRecordUid: metadata.sourceRecordUid?.trim(),
    sourceSentAt: metadata.sourceSentAt,
    recognitionReason: metadata.recognitionReason.trim(),
    recognitionConfidence: metadata.recognitionConfidence,
    addedAt: timestamp,
  };
}

export function normalizeRelatedSources(item: Partial<ArrangementItem>) {
  const relatedSources = Array.isArray(item.relatedSources)
    ? item.relatedSources
        .map(normalizeRelatedSource)
        .filter((source): source is ArrangementRelatedSource => Boolean(source))
    : [];
  const legacySource = buildRelatedSourceFromLegacy(item);
  const mergedSources = legacySource
    ? [legacySource, ...relatedSources]
    : relatedSources;

  return dedupeRelatedSources(mergedSources);
}

export function getArrangementRelatedSources(arrangement: ArrangementItem) {
  if (arrangement.relatedSources?.length) {
    return [...arrangement.relatedSources].sort(
      (a, b) => getSourceTime(a) - getSourceTime(b)
    );
  }

  const legacySource = buildRelatedSourceFromLegacy(arrangement);
  return legacySource ? [legacySource] : [];
}

export function dedupeRelatedSources(sources: ArrangementRelatedSource[]) {
  const seenKeys = new Set<string>();
  return sources.filter((source) => {
    const key =
      source.sourceRecordUid?.trim() ||
      `${normalizeSourceKeyText(source.sourceText)}:${source.sourceSentAt ?? ""}`;
    if (!key || seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

function normalizeRelatedSource(
  value: unknown,
  fallbackIndex: number
): ArrangementRelatedSource | null {
  if (!value || typeof value !== "object") return null;

  const source = value as Partial<ArrangementRelatedSource>;
  const sourceText = normalizeString(source.sourceText).trim();
  if (!sourceText) return null;

  return {
    id: normalizeString(source.id) || `source-${fallbackIndex}`,
    sourceText,
    sourceType: isArrangementSourceType(source.sourceType)
      ? source.sourceType
      : undefined,
    sourceLabel: normalizeString(source.sourceLabel),
    sourceRecordUid: normalizeString(source.sourceRecordUid),
    sourceSentAt: normalizeOptionalTimestamp(source.sourceSentAt),
    recognitionReason: normalizeString(source.recognitionReason),
    recognitionConfidence: normalizeOptionalConfidence(source.recognitionConfidence),
    addedAt: normalizeTimestamp(source.addedAt, Date.now() + fallbackIndex),
  };
}

function buildRelatedSourceFromLegacy(
  item: Partial<ArrangementItem>
): ArrangementRelatedSource | null {
  const sourceText = normalizeString(item.sourceText).trim();
  if (!sourceText) return null;

  return {
    id: buildSourceId(normalizeString(item.sourceRecordUid), sourceText, item.sourceSentAt),
    sourceText,
    sourceType: isArrangementSourceType(item.sourceType) ? item.sourceType : undefined,
    sourceLabel: normalizeString(item.sourceLabel),
    sourceRecordUid: normalizeString(item.sourceRecordUid),
    sourceSentAt: normalizeOptionalTimestamp(item.sourceSentAt),
    recognitionReason: normalizeString(item.recognitionReason),
    recognitionConfidence: normalizeOptionalConfidence(item.recognitionConfidence),
    addedAt: normalizeTimestamp(item.updatedAt, Date.now()),
  };
}

function buildSourceId(
  sourceRecordUid: string | undefined,
  sourceText: string,
  sourceSentAt: number | undefined
) {
  if (sourceRecordUid?.trim()) return `record:${sourceRecordUid.trim()}`;
  return `text:${normalizeSourceKeyText(sourceText).slice(0, 28)}:${sourceSentAt ?? 0}`;
}

function normalizeSourceKeyText(value: string) {
  return value
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:\s"'`~～（）()[\]【】]/g, "");
}

function isArrangementSourceType(value: unknown): value is ArrangementSourceType {
  return value === "manual_text" || value === "self" || value === "test";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeOptionalTimestamp(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeOptionalConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value));
}

function getSourceTime(source: ArrangementRelatedSource) {
  return source.sourceSentAt ?? source.addedAt;
}
