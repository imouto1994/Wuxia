const fs = require("fs").promises;

function format(conditionText) {
  const lines = conditionText.split("\n");
  const formattedLines = [];
  lines.splice(0, 1);

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    const infos = line.split("\t");
    formattedLines.push(`### ${infos[1]}`);
    formattedLines.push("");

    formattedLines.push(`${infos[2]}`);

    formattedLines.push("");
  }
  return formattedLines.join("\n");
}

async function main() {
  const conditionText = await fs.readFile("./BattleCondition.txt", "utf8");
  const formattedConditionText = format(conditionText);
  await fs.writeFile(
    "./BattleConditionFormat.md",
    formattedConditionText,
    "utf8",
  );
}

main();
