const fs = require("fs").promises;

function format(neigongText) {
  const lines = neigongText.split("\n");
  const formattedLines = [];
  lines.splice(0, 1);
  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    const infos = line.split("\t");
    formattedLines.push(`# ${infos[1]}`);
    formattedLines.push("");

    const abilities = infos[2].split("<br>");
    const formattedAbilities = abilities.map(ability =>
      ability.trim().startsWith("[")
        ? `**${ability
            .trim()
            .substring(8)
            .replace("[-]", "**")}`
        : ability.trim(),
    );
    for (const ability of formattedAbilities) {
      formattedLines.push(`- ${ability}`);
    }

    formattedLines.push("");
  }
  return formattedLines.join("\n");
}

const FILTER_ARRAY = [];

function json(neigongText) {
  const lines = neigongText.split("\n");
  lines.splice(0, 1);

  return JSON.stringify(
    lines
      .map(line => {
        const infos = line.split("\t");
        if (
          FILTER_ARRAY.length !== 0 &&
          !FILTER_ARRAY.includes(parseInt(infos[0], 10))
        ) {
          return null;
        }

        return {
          m_iNeigongID: parseInt(infos[0]),
          m_iLV: 10,
          m_iAccumulationExp: 100000,
          m_strStatusImage: infos[6],
          m_strSelectImage: infos[5],
          m_strNeigongName: infos[1],
          m_iExp: 1,
        };
      })
      .filter(i => i != null),
    null,
    2,
  );
}

async function main() {
  const neigongText = await fs.readFile("./BattleNeigong.txt", "utf8");
  const formattedNeigongText = format(neigongText);
  await fs.writeFile("./BattleNeigongFormat.md", formattedNeigongText, "utf8");
  const jsonNeigongText = json(neigongText);
  await fs.writeFile("./BattleNeigongFormat.json", jsonNeigongText, "utf8");
}

main();
