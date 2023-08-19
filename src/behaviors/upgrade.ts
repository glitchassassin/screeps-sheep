import { costCallback } from "./costCallback";
import { moveTo } from "./moveTo";

export function upgrade(creep: Creep) {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return "harvest";
  const controller = Game.rooms[creep.memory.room]?.controller;
  if (!controller) return "harvest";
  if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
    moveTo(creep, controller, { costCallback });
  }
  return "upgrade";
}
