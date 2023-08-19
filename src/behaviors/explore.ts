import { getExploreRooms } from "utils/exploreRooms";
import { costCallback } from "./costCallback";
import { moveTo } from "./moveTo";

const exploreTargets = new Map<string, string>();
const skipExploreTargets = new Set<string>();

export function explore(creep: Creep) {
  let exploreTarget = exploreTargets.get(creep.name);
  exploreTarget ??= getExploreRooms(creep.memory.room).find(
    room => !skipExploreTargets.has(room) && !Memory.exploredRooms.includes(room)
  );
  if (!exploreTarget || Game.rooms[exploreTarget]) {
    return "harvest";
  }
  if (moveTo(creep, new RoomPosition(25, 25, exploreTarget), { range: 20, costCallback }) === ERR_NO_PATH) {
    skipExploreTargets.add(exploreTarget);
  }
  return "explore";
}
