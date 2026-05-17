export function mergePersonText(current: string, incoming: string) {
  const currentPeople = dedupePeople(splitPersonText(current));
  const incomingPeople = splitPersonText(incoming);
  const mergedPeople = [...currentPeople];
  const seenPeople = new Set(currentPeople.map(normalizePersonKey));

  incomingPeople.forEach((person) => {
    const key = normalizePersonKey(person);
    if (!key || seenPeople.has(key)) return;
    seenPeople.add(key);
    mergedPeople.push(person);
  });

  if (mergedPeople.length > 0) return mergedPeople.join("、");
  return current.trim() || incoming.trim();
}

export function collectPersonTextFromSources(
  sources: Array<{ sourceText?: string; recognitionReason?: string }>
) {
  const people = sources.flatMap((source) => {
    const quotedPeople = extractQuotedPeople(source.recognitionReason ?? "");
    if (quotedPeople.length > 0) return quotedPeople;
    return extractActionPeople(source.sourceText ?? "");
  });

  return mergePersonText("", people.join("、"));
}

function splitPersonText(value: string) {
  return value
    .trim()
    .split(/[、,，;；/|\s]+/)
    .map(normalizePersonCandidate)
    .filter(isValidPersonCandidate);
}

function normalizePersonKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function dedupePeople(people: string[]) {
  const seenPeople = new Set<string>();
  return people.filter((person) => {
    const key = normalizePersonKey(person);
    if (!key || seenPeople.has(key)) return false;
    seenPeople.add(key);
    return true;
  });
}

function extractQuotedPeople(value: string) {
  return [...value.matchAll(/(?:人物|参与人|相关人)[“"']([^”"']+)[”"']/g)].map(
    (match) => match[1]
  );
}

function extractActionPeople(value: string) {
  const people: string[] = [];
  const actionPattern =
    /(?:和|跟|与)([^，。！？、,\s]+?)(?:一起)?(?:打|玩|去|买|带|看|吃|做|提交|整理|复查)/g;
  const givePattern = /给([^，。！？、,\s]+?)(?:买|带|发|拿|送)/g;

  for (const match of value.matchAll(actionPattern)) people.push(match[1]);
  for (const match of value.matchAll(givePattern)) people.push(match[1]);

  return people;
}

function normalizePersonCandidate(value: string) {
  return value
    .trim()
    .replace(/^(人物|参与人|相关人)[:：]/, "")
    .replace(/[在到去].*$/, "")
    .trim();
}

function isValidPersonCandidate(value: string) {
  if (!value) return false;
  if (placeLikeSuffixes.some((suffix) => value.endsWith(suffix))) return false;
  if (nonPersonWords.has(value)) return false;
  return true;
}

const placeLikeSuffixes = ["饭店", "药店", "医院", "公司", "学校", "门店", "餐厅"];
const nonPersonWords = new Set(["地点", "时间", "附近", "下周末", "周末"]);
