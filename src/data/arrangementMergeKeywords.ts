export function getSharedDistinctiveTermScore(
  left: string,
  right: string,
  hasSharedAction: boolean
) {
  const leftTerms = getDistinctiveTerms(left);
  const rightTerms = getDistinctiveTerms(right);
  const sharedTerms = [...leftTerms].filter((term) => rightTerms.has(term));

  if (sharedTerms.length === 0) return 0;

  const latinScore = sharedTerms.some((term) => /[a-z0-9]/.test(term)) ? 6 : 0;
  const cjkScore = sharedTerms
    .filter((term) => /[\u4e00-\u9fff]/.test(term))
    .reduce((score, term) => score + (term.length >= 3 ? 5 : 4), 0);
  const actionBonus = hasSharedAction ? 2 : 0;

  return Math.min(8, latinScore + cjkScore + actionBonus);
}

function getDistinctiveTerms(text: string) {
  const terms = new Set<string>();
  const latinTerms = text.match(/[a-z0-9][a-z0-9+#._-]{2,}/g) ?? [];

  latinTerms
    .filter((term) => !weakLatinTerms.has(term))
    .forEach((term) => terms.add(term));

  const cjkText = cjkNoiseWords.reduce(
    (current, word) => current.split(word).join(" "),
    text.replace(/[^\u4e00-\u9fff]/g, " ")
  );
  const cjkTerms = cjkText.match(/[\u4e00-\u9fff]{2,}/g) ?? [];

  cjkTerms
    .filter((term) => !weakCjkTerms.has(term))
    .forEach((term) => terms.add(term));

  return terms;
}

const weakLatinTerms = new Set(["todo", "task"]);
const weakCjkTerms = new Set("事情 安排 计划 项目 这个 那个 一下".split(" "));

const cjkNoiseWords =
  "今天 明天 后天 上午 下午 晚上 中午 周一 周二 周三 周四 周五 周六 周日 和 跟 与 给 帮 我 你 他 她 我们 你们 他们 一起 其他 室友 朋友 同学 同事 玩 打 带 买 去".split(
    " "
  );
