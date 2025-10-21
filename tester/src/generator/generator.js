import combineNF1 from "./combine/nf1.js";
import combineNF2 from "./combine/nf2.js";
import combineNF3 from "./combine/nf3.js";
import combineNF4 from "./combine/nf4.js";
import combineNF5 from "./combine/nf5.js";
import { SIZE_PRESETS } from "./config/sizes.js";
import { insertData, truncateSchema } from "./utils/api.js";

export async function generateAndUpload(preset) {
  const nf3 = combineNF3(SIZE_PRESETS[preset]);
  const nf2 = combineNF2(nf3);
  const nf1 = combineNF1(nf2);
  const nf4 = combineNF4(nf3);
  const nf5 = combineNF5(nf4);

  async function uploadSchema(schemaName, tables) {
    await truncateSchema(schemaName);

    for (const [key, value] of Object.entries(tables)) {
      await insertData(schemaName, key, value);
    }
    // console.log(`${schemaName.toUpperCase()} is done`);
  }

  await uploadSchema("nf1", nf1);
  await uploadSchema("nf2", nf2);
  await uploadSchema("nf3", nf3);
  await uploadSchema("nf4", nf4);
  await uploadSchema("nf5", nf5);
  return nf3;
}
