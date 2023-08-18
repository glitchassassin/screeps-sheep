import { costCallback } from "./costCallback";

const assignedSpawns = new Map<string, string>();

export function transfer(creep: Creep) {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    assignedSpawns.delete(creep.name);
    return "harvest";
  }
  let assignedSpawn = assignedSpawns.get(creep.name);
  if (assignedSpawn && Game.spawns[assignedSpawn]?.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    assignedSpawn = undefined;
    assignedSpawns.delete(creep.name);
  }
  if (!assignedSpawn) {
    const spawns = Game.rooms[creep.memory.room]
      ?.find(FIND_MY_SPAWNS)
      .filter(s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    if (!spawns?.length) {
      assignedSpawns.delete(creep.name);
      return "upgrade";
    }
    assignedSpawn = spawns[Math.floor(Math.random() * spawns.length)].name;
    assignedSpawns.set(creep.name, assignedSpawn);
  }
  const spawn = Game.spawns[assignedSpawn];
  if (!spawn) {
    assignedSpawns.delete(creep.name);
    return "transfer";
  }
  if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    if (Game.time % 2 === 0) creep.moveTo(spawn, { costCallback });
  }
  return "transfer";
}
