import { getCachedSourcesPositions, getSourceByCachedPos } from "structures/sources";
import { adjacentWalkablePositions, findClosestByPath } from "utils/MapCoordinates";
import { costCallback } from "./costCallback";

const assignedSources = new Map<string, RoomPosition>();

export function harvest(creep: Creep) {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    assignedSources.delete(creep.name);
    return Math.random() > 0.9 ? "transfer" : "upgrade";
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
      console.log("No source found");
      assignedSources.delete(creep.name);
      return "explore";
    }
    assignedSource = closestSource;
    assignedSources.set(creep.name, assignedSource);
  }

  if (Game.time % 2 === 0) creep.moveTo(assignedSource, { costCallback });

  const source = getSourceByCachedPos(assignedSource);
  if (source) creep.harvest(source);
  return "harvest";
}
