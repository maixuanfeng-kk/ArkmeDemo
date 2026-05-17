export function mergeTitleText(current: string, incoming: string) {
  const currentTitles = splitTitleText(current);
  const incomingTitles = splitTitleText(incoming);
  const mergedTitles = compactTitleParts([...currentTitles]);
  const seenTitles = new Set(currentTitles.map(normalizeTitleKey));

  incomingTitles.forEach((title) => {
    const key = normalizeTitleKey(title);
    if (!key || seenTitles.has(key)) return;
    seenTitles.add(key);
    mergedTitles.push(title);
  });

  return compactTitleParts(mergedTitles).join(titleSeparator) || current.trim() || incoming.trim();
}

export function getArrangementTitleParts(title: string) {
  return compactTitleParts(splitTitleText(title));
}

export function recoverWeakTitleText(current: string, candidates: string[]) {
  const currentTitles = getArrangementTitleParts(current);
  if (currentTitles.length === 0) return "";

  const candidateTitles = compactTitleParts(candidates.flatMap((value) => splitTitleText(value)));
  if (candidateTitles.length === 0) return "";

  const recoveredTitles = currentTitles.map((title) =>
    recoverWeakTitlePart(title, candidateTitles)
  );
  const changed = recoveredTitles.some(
    (title, index) => normalizeTitleKey(title) !== normalizeTitleKey(currentTitles[index] ?? "")
  );

  return changed ? recoveredTitles.join(titleSeparator) : "";
}

export function resolveArrangementTitle({
  currentTitle,
  noteText = "",
  sources = [],
}: {
  currentTitle: string;
  noteText?: string;
  sources?: Array<{ sourceText?: string; sourceLabel?: string }>;
}) {
  const sourceTitleText = collectTitleTextFromSources(sources);
  const recoveredTitleText = recoverWeakTitleText(currentTitle, [
    sourceTitleText,
    mergeTitleText("", noteText),
  ]);

  return mergeTitleText(
    currentTitle,
    [sourceTitleText, recoveredTitleText].filter(Boolean).join(titleSeparator)
  );
}

export function collectTitleTextFromSources(
  sources: Array<{ sourceText?: string; sourceLabel?: string }>
) {
  const titles = sources
    .flatMap((source) =>
      getTitleCandidatesFromSource(source.sourceText ?? "", source.sourceLabel)
    )
    .filter(Boolean);

  return mergeTitleText("", titles.join(titleSeparator));
}

function splitTitleText(value: string) {
  return value
    .split(/\s*(?:\/|｜|\|)\s*/g)
    .map(extractActionTitle)
    .filter(Boolean);
}

function extractActionTitle(value: string) {
  const trimmedText = value.trim();
  if (isConversationSpeakerLine(trimmedText)) return "";

  const text = removePoliteSuffix(removeLeadingTime(trimmedText));
  if (!text) return "";

  const withPerson = extractPersonActionTitle(text);
  if (withPerson) return withPerson;

  const directAction = extractDirectActionTitle(text);
  return directAction || text;
}

function recoverWeakTitlePart(current: string, candidates: string[]) {
  if (!isWeakTitlePart(current)) return current;

  const recovered = candidates
    .map((candidate) => expandWeakTitle(current, candidate))
    .filter(Boolean)
    .sort(
      (left, right) =>
        normalizeTitleKey(right).length - normalizeTitleKey(left).length
    )[0];

  return recovered || current;
}

function getTitleCandidatesFromSource(sourceText: string, sourceLabel = "") {
  const text = sourceText.trim();
  if (!text || isConversationContextSource(text)) return [];
  if (sourceLabel === "原安排" || sourceLabel === "手动创建") {
    return [extractActionTitleFromSourceLine(text.split("\n")[0] ?? "")].filter(Boolean);
  }

  return text
    .split("\n")
    .map((line) => extractActionTitleFromSourceLine(line))
    .filter(Boolean);
}

function extractActionTitleFromSourceLine(line: string) {
  const text = line.trim();
  if (!text || knownSourceFieldPrefixes.some((prefix) => text.startsWith(prefix))) {
    return "";
  }

  const cleanedText = removePoliteSuffix(removeLeadingTime(text));
  const withPerson = extractPersonActionTitle(cleanedText);
  if (withPerson) return withPerson;

  return extractDirectActionTitle(cleanedText);
}

function isConversationContextSource(text: string) {
  const speakerLineCount = text
    .split("\n")
    .filter((line) => isConversationSpeakerLine(line.trim())).length;

  return speakerLineCount >= 2;
}

function isConversationSpeakerLine(line: string) {
  if (!line.includes("：") && !line.includes(":")) return false;
  if (knownSourceFieldPrefixes.some((prefix) => line.startsWith(prefix))) return false;

  return /^[^：:]{1,20}(?:（当前选择）)?[：:]/.test(line);
}

function extractPersonActionTitle(text: string) {
  const giveMatch = /^给([^，。！？、,\s]+)(买药|买|带|发|拿|送|取)([^，。！？、,\s]*)/u.exec(text);
  if (giveMatch) return `给${giveMatch[1]}${giveMatch[2]}${giveMatch[3]}`;

  const togetherMatch =
    /(?:和|跟|与)([^在到，。！？、,\s]+?)(?:一起)?(?:在[^，。！？、,\s]+)?(吃饭|玩[^，。！？、,\s]*|打[^，。！？、,\s]*|看[^，。！？、,\s]*|复查|买药|买[^，。！？、,\s]*|带[^，。！？、,\s]*|做[^，。！？、,\s]*)/u.exec(text);

  return togetherMatch ? `和${togetherMatch[1]}${togetherMatch[2]}` : "";
}

function extractDirectActionTitle(text: string) {
  const actionMatch =
    /(吃饭|买药|复查|体检|挂号|看病|面试|带[^，。！？、,\s]*|发出[^，。！？、,\s]*|玩[^，。！？、,\s]*|打[^，。！？、,\s]*|提交[^，。！？、,\s]*|整理[^，。！？、,\s]*)/u.exec(text);
  return actionMatch?.[1] ?? "";
}

function removeLeadingTime(value: string) {
  return value
    .replace(
      /^(今天|明天|后天|今晚|明晚|下周末|这周末|本周末|下周[一二三四五六日天]?|这周[一二三四五六日天]?|本周[一二三四五六日天]?|周[一二三四五六日天]|星期[一二三四五六日天]|上午|下午|晚上|中午)+/,
      ""
    )
    .replace(/^([一二两三四五六七八九十\d]{1,3})(点|时|:|：)(半|\d{1,2})?/, "")
    .replace(/^(上午|下午|晚上|中午)+/, "");
}

function removePoliteSuffix(value: string) {
  return value.replace(/[吧呀哦哈啦了。！？!?,，\s]+$/u, "").trim();
}

function expandWeakTitle(current: string, candidate: string) {
  const currentKey = normalizeTitleKey(current);
  const candidateKey = normalizeTitleKey(candidate);
  if (!currentKey || !candidateKey || candidateKey === currentKey) return "";
  if (candidateKey.includes(currentKey) && shouldPreferTitle(candidate, current)) {
    return candidate;
  }

  const action = getWeakTitleTrailingAction(current);
  if (!action || !candidate.startsWith(action)) return "";

  const expanded = `${current.slice(0, -action.length)}${candidate}`;
  return normalizeTitleKey(expanded).length > currentKey.length ? expanded : "";
}

function compactTitleParts(titles: string[]) {
  const uniqueTitles = dedupeExactTitles(titles);
  return uniqueTitles.filter((title, index) => {
    const key = normalizeTitleKey(title);
    if (!key) return false;
    if (uniqueTitles.length > 1 && isSupplementOnlyTitle(title)) return false;

    return !uniqueTitles.some((otherTitle, otherIndex) => {
      if (index === otherIndex) return false;
      const otherKey = normalizeTitleKey(otherTitle);
      if (!otherKey || key === otherKey) return false;
      return otherKey.includes(key) && shouldPreferTitle(otherTitle, title);
    });
  });
}

function isSupplementOnlyTitle(title: string) {
  return /^带[上好]/.test(title);
}

function dedupeExactTitles(titles: string[]) {
  const seenTitles = new Set<string>();
  return titles.filter((title) => {
    const key = normalizeTitleKey(title);
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
}

function shouldPreferTitle(candidate: string, current: string) {
  if (hasTimeWord(candidate) && !hasTimeWord(current)) return false;
  return normalizeTitleKey(candidate).length > normalizeTitleKey(current).length;
}

function hasTimeWord(value: string) {
  return /(今天|明天|后天|周[一二三四五六日天]|星期[一二三四五六日天]|下周|这周|本周|上午|下午|晚上|中午|\d{1,2}点|[一二两三四五六七八九十]{1,3}点)/.test(
    value
  );
}

function isWeakTitlePart(value: string) {
  return Boolean(getWeakTitleTrailingAction(value));
}

function getWeakTitleTrailingAction(value: string) {
  return weakTitleActionPattern.exec(value.trim())?.[1] ?? "";
}

function normalizeTitleKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

const titleSeparator = " / ";
const weakTitleActionPattern =
  /(打|玩|买|带|发|做|去|看|吃|写|交|送|拿|取)$/u;
const knownSourceFieldPrefixes = [
  "时间：",
  "时间类型：",
  "开始：",
  "结束：",
  "提醒：",
  "相关人：",
  "地点：",
  "补充：",
  "备注：",
];
