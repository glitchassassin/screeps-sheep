import { sheep } from "roles/sheep";
import { structures } from "structures";
import "ts-polyfill/lib/es2019-array";
import { ErrorMapper } from "utils/ErrorMapper";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  structures();

  for (const name in Game.creeps) {
    try {
      sheep(Game.creeps[name]);
    } catch (e) {
      console.log(e, (e as any).stack);
    }
  }
});
