import { getCachedSourcesPositions, getSourceByCachedPos } from "structures/sources";
import { adjacentWalkablePositions, findClosestByPath } from "utils/MapCoordinates";
import { costCallback } from "./costCallback";
import { moveTo } from "./moveTo";

const assignedSources = new Map<string, RoomPosition>();

export function harvest(creep: Creep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    assignedSources.delete(creep.name);
    const energy = Game.rooms[creep.memory.room].energyAvailable / Game.rooms[creep.memory.room].energyCapacityAvailable;
    return Math.random() < (1 - energy) * 0.2 + 0.8 ? "transfer" : "upgrade";
  }
  let assignedSource = assignedSources.get(creep.name);
  if (!assignedSource) {
    const sources = getCachedSourcesPositions();
    const closestSource = findClosestByPath(
      creep.pos,
      sources
        .filter(s => {
          const spaces = adjacentWalkablePositions(s.pos, true).length;
          const assigned = [...assignedSources.values()].filter(p => p.isEqualTo(s.pos)).length;
          return spaces > assigned;
        })
        .map(s => s.pos)
    );
    if (!closestSource) {
      assignedSources.delete(creep.name);
      return "explore";
    }
    assignedSource = closestSource;
    assignedSources.set(creep.name, assignedSource);
  }

  moveTo(creep, assignedSource, { costCallback })

  const source = getSourceByCachedPos(assignedSource);
  if (source) creep.harvest(source);
  return "harvest";
}
