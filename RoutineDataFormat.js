const fs = require("fs").promises;

function getSortedLines(routineText, npcMap) {
  const lines = routineText.split("\n");

  lines.splice(0, 1);
  lines.sort((lineA, lineB) => {
    const infosA = lineA.split("\t");
    const weaponA = parseInt(infosA[3], 10);
    const nameA = infosA[1];
    if (!infosA[2].startsWith("Player")) {
      infosA[2] = npcMap[infosA[2].toLowerCase()] || infosA[2];
    } else {
      infosA[2] = "Đông Phương Vị Minh";
    }
    const infosB = lineB.split("\t");
    const weaponB = parseInt(infosB[3], 10);
    const nameB = infosB[1];
    if (!infosB[2].startsWith("Player")) {
      infosB[2] = npcMap[infosB[2].toLowerCase()] || infosB[2];
    } else {
      infosB[2] = "Đông Phương Vị Minh";
    }

    const net = weaponA - weaponB;
    const nameCompare = nameA.localeCompare(nameB);
    const npcCompare = infosA[2].localeCompare(infosB[2]);
    return net === 0 ? (nameCompare === 0 ? npcCompare : nameCompare) : net;
  });

  return lines;
}

async function format(routineText) {
  const npcMap = await getNpcMap();
  const battleAbilityMap = await getBattleAbilityMap();
  const battleConditionMap = await getBattleConditionMap();
  const formattedLines = [];
  const lines = getSortedLines(routineText, npcMap);

  let previous;
  let counter = 0;
  for (const line of lines) {
    const infos = line.split("\t");
    if (previous == null || infos[3] !== previous[3]) {
      if (previous != null) {
        formattedLines.push("");
      }
      formattedLines.push(`## Vũ Khí: ${infos[3]}`);
    }

    if (previous == null || infos[1] !== previous[1]) {
      previous = infos;
      counter = 0;
    } else {
      counter++;
    }
    if (!infos[2].startsWith("Player")) {
      infos[2] = npcMap[infos[2].toLowerCase()] || infos[2];
    } else {
      infos[2] = "Đông Phương Vị Minh";
    }
    formattedLines.push(
      `- [${infos[1]} - ${infos[2]}](#${infos[1]
        .toLowerCase()
        .split(" ")
        .join("-")}${counter !== 0 ? `-${counter}` : ""})`,
    );
  }

  formattedLines.push("");

  for (const line of lines) {
    const infos = line.split("\t");
    formattedLines.push(`# ${infos[1]}`);
    formattedLines.push("");

    formattedLines.push(`- **ID**: ${infos[0]}`);
    if (!infos[2].startsWith("Player")) {
      infos[2] = npcMap[infos[2].toLowerCase()] || infos[2];
    } else {
      infos[2] = "Đông Phương Vị Minh";
    }
    formattedLines.push(`- **Nhân Vật**: ${infos[2]}`);
    formattedLines.push(`- **Vũ Khí**: ${infos[3]}`);
    formattedLines.push("- **Chiêu Thức**:");

    const skillIds = [infos[4], infos[5], infos[7]].filter(
      skillId => skillId !== "0",
    );
    for (const skillId of skillIds) {
      const skill = battleAbilityMap[skillId];
      if (skill == null) {
        continue;
      }
      formattedLines.push(`   - **${skill.name}**:`);
      const conditions = skill.conditionIds
        .map(id => battleConditionMap[id])
        .filter(condition => condition != null);
      if (conditions.length !== 0) {
        formattedLines.push(`       - **Hiệu Ứng**: ${conditions.join(", ")}`);
      }
      formattedLines.push(
        `       - **Mục Tiêu**: ${skill.targetType === "2" ? "Địch" : "Ta"}`,
      );
      formattedLines.push(
        `       - **Dạng Mục Tiêu**: ${
          skill.needToSelectTarget === "0"
            ? "None"
            : skill.targetArea === "0"
            ? "Điểm"
            : skill.targetArea === "1"
            ? "Line"
            : "Arc"
        }`,
      );
      formattedLines.push(`       - **Khoảng Cách**: ${skill.range}`);
      formattedLines.push(`       - **AOE**: ${skill.aoe}`);
      formattedLines.push(`       - **Min Damage**: ${skill.minDamage}`);
      formattedLines.push(`       - **Max Damage**: ${skill.maxDamage}`);
      formattedLines.push(`       - **Cooldown**: ${skill.cooldown}`);
    }

    formattedLines.push("");
  }

  return formattedLines.join("\n");
}

const FILTER_ARRAY = [
  10157,
  10036,
  10501,
  10311,
  10625,
  10002,
  10650,
  10466,
  10645,
  10586,
  10007,
  10677,
  10266,
  10407,
  10106,
  10724,
  10031,
  10296,
  10676,
  10063,
  10026,
  10516,
  10674,
  10673,
  10670,
  10678,
  10118,
  10672,
  10563,
  10646,
  10446,
  10556,
  10548,
  10276,
  10621,
  10396,
  10531,
  10109,
  10041,
  10176,
  10631,
  10251,
  10171,
  10675,
  10368,
  10256,
  10649,
  10411,
  10011,
  10306,
  10680,
  10152,
  10153,
];
const HIGHEST_ID = 70060;

async function json(routineText) {
  const npcMap = await getNpcMap();
  const battleAbilityMap = await getBattleAbilityMap();
  const battleConditionMap = await getBattleConditionMap();
  const lines = getSortedLines(routineText, npcMap);
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
          m_iRoutineID: parseInt(infos[0], 10) + HIGHEST_ID,
          m_strRoutineName: infos[1],
          m_iWearAmsType: parseInt(infos[3], 10) === 3 ? 3 : 1,
          m_iAccumulationExp: 100000,
          m_iLV: 10,
        };
      })
      .filter(i => i != null),
    null,
    2,
  );
}

async function text(routineText) {
  const npcMap = await getNpcMap();
  const battleAbilityMap = await getBattleAbilityMap();
  const battleConditionMap = await getBattleConditionMap();
  const originalLines = routineText.split("\n");
  const lines = getSortedLines(routineText, npcMap);
  const extraLines = lines
    .filter(line => {
      const infos = line.split("\t");
      return (
        FILTER_ARRAY.length === 0 ||
        FILTER_ARRAY.includes(parseInt(infos[0], 10))
      );
    })
    .map(line => {
      const infos = line.split("\t");
      infos[0] = parseInt(infos[0], 10) + HIGHEST_ID;
      if (infos[3] === "3") {
        infos[2] = "Player_leg";
      } else {
        infos[2] = "Player_un";
        infos[3] = 1;
      }
      return infos.join("\t");
    });
  return originalLines.concat(extraLines).join("\n");
}

async function getNpcMap() {
  const npcText = await fs.readFile("./NpcData.txt", "utf8");
  const lines = npcText.split("\n");
  lines.splice(0, 1);

  return lines.reduce((map, currentLine) => {
    const infos = currentLine.split("\t");
    if (map[infos[1].toLowerCase()] == null) {
      map[infos[1].toLowerCase()] = infos[5];
    }

    return map;
  }, {});
}

async function getBattleAbilityMap() {
  const battleAbilityText = await fs.readFile("./BattleAbility.txt", "utf8");
  const lines = battleAbilityText.split("\n");
  lines.splice(0, 1);

  return lines.reduce((map, currentLine) => {
    const infos = currentLine.split("\t");
    map[infos[0]] = {
      name: infos[1],
      conditionIds: infos[13].split(","),
      cooldown: infos[11],
      needToSelectTarget: infos[2],
      skillType: infos[3],
      targetType: infos[4],
      targetArea: infos[5],
      range: infos[6],
      aoe: infos[7],
      minDamage: infos[8],
      maxDamage: infos[9],
    };
    return map;
  }, {});
}

async function getBattleConditionMap() {
  const battleConditionText = await fs.readFile(
    "./BattleCondition.txt",
    "utf8",
  );
  const lines = battleConditionText.split("\n");
  lines.splice(0, 1);

  return lines.reduce((map, currentLine) => {
    const infos = currentLine.split("\t");
    map[infos[0]] = infos[1];
    return map;
  }, {});
}

async function main() {
  const routineText = await fs.readFile("./RoutineData.txt", "utf8");
  const formattedRoutineText = await format(routineText);
  await fs.writeFile("./RoutineDataFormat.md", formattedRoutineText, "utf8");
  const jsonRoutineText = await json(routineText);
  await fs.writeFile("./RoutineDataFormat.json", jsonRoutineText, "utf8");
  const textRoutineText = await text(routineText);
  await fs.writeFile("./RoutineDataFormat.txt", textRoutineText, "utf8");
}

main();
