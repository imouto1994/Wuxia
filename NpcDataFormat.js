const fs = require("fs").promises;

function format(dataText) {
  const lines = dataText.split("\n");
  const formattedLines = [];
  lines.splice(0, 1);
  const maps = {};
  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    const infos = line.split("\t");
    if (maps[infos[6].toLowerCase()] == null && infos[6] !== "0") {
      maps[infos[6].toLowerCase()] = 1;
      formattedLines.push(`# ${infos[5]}`);
      formattedLines.push("");

      formattedLines.push(`- ${infos[6]}`);

      formattedLines.push("");
    }
  }
  return formattedLines.join("\n");
}

async function main() {
  const dataText = await fs.readFile("./NpcData.txt", "utf8");
  const formattedDataText = format(dataText);
  await fs.writeFile("./NpcDataFormat.md", formattedDataText, "utf8");
}

main();
