import { explore } from "behaviors/explore";
import { harvest } from "behaviors/harvest";
import { runAwayFromEnemies } from "behaviors/runAway";
import { transfer } from "behaviors/transfer";
import { upgrade } from "behaviors/upgrade";
import { runStates } from "utils/states";

export function sheep(creep: Creep) {
  // herding logic
  if (runAwayFromEnemies(creep)) return;

  runStates(
    {
      harvest,
      transfer,
      upgrade,
      explore
    },
    creep
  );
}
