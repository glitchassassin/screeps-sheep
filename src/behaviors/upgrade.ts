import { costCallback } from "./costCallback";

export function upgrade(creep: Creep) {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return "harvest";
  const controller = Game.rooms[creep.memory.room]?.controller;
  if (!controller) return "harvest";
  if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
    if (Game.time % 2 === 0) creep.moveTo(controller, { costCallback });
  }
  return "upgrade";
}
