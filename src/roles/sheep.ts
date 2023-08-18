import { getCachedSourcesPositions, getSourceByCachedPos } from "structures/sources";
import { adjacentWalkablePositions, findClosestByPath } from "utils/MapCoordinates";
import { getExploreRooms } from "utils/exploreRooms";
import { runStates } from "utils/states";

declare global {
  interface CreepMemory {
    room: string;
  }
}

const assignedSources = new Map<string, RoomPosition>();
const assignedSpawns = new Map<string, string>();
const exploreTargets = new Map<string, string>();
const skipExploreTargets = new Set<string>();

export function sheep(creep: Creep) {
  runStates(
    {
      harvest: (creep: Creep) => {
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

        creep.moveTo(assignedSource);

        const source = getSourceByCachedPos(assignedSource);
        if (source) creep.harvest(source);
        return "harvest";
      },
      transfer: (creep: Creep) => {
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
          creep.moveTo(spawn);
        }
        return "transfer";
      },
      upgrade: (creep: Creep) => {
        const controller = Game.rooms[creep.memory.room]?.controller;
        if (!controller) return "harvest";
        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(controller);
        }
        return "upgrade";
      },
      explore: (creep: Creep) => {
        let exploreTarget = exploreTargets.get(creep.name);
        exploreTarget ??= getExploreRooms(creep.memory.room).find(
          room => !skipExploreTargets.has(room) && !Memory.exploredRooms.includes(room)
        );
        if (!exploreTarget || Game.rooms[exploreTarget]) {
          return "harvest";
        }
        if (creep.moveTo(new RoomPosition(25, 25, exploreTarget), { range: 20 }) === ERR_NO_PATH) {
          skipExploreTargets.add(exploreTarget);
        }
        return "explore";
      }
    },
    creep
  );
}
