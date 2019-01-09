const fs = require("fs").promises;

function format(dataText) {
  const lines = dataText.split("\n");
  const formattedLines = [lines[0]];
  lines.splice(0, 1);
  for (const line of lines) {
    const infos = line.split("\t");
    infos[11] = "0";
    formattedLines.push(infos.join("\t"));
  }
  return formattedLines.join("\n");
}

async function main() {
  const dataText = await fs.readFile("./BattleAbility.txt", "utf8");
  const formattedDataText = format(dataText);
  await fs.writeFile("./BattleAbilityFormat.txt", formattedDataText, "utf8");
}

main();
