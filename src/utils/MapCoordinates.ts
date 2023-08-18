import { memoize, memoizeByTick } from "utils/memoize";

export const calculateAdjacencyMatrix = memoize(
  (proximity: number) => "" + proximity,
  (proximity = 1): { x: number; y: number }[] => {
    let adjacencies = new Array(proximity * 2 + 1).fill(0).map((v, i) => i - proximity);

    return adjacencies
      .flatMap(x => adjacencies.map(y => ({ x, y })))
      .filter((a: { x: number; y: number }) => !(a.x === 0 && a.y === 0));
  }
);
export const calculateAdjacentPositions = memoize(
  (pos: RoomPosition) => pos.toString(),
  (pos: RoomPosition) => {
    return calculateNearbyPositions(pos, 1);
  }
);

export const adjacentWalkablePositions = (pos: RoomPosition, ignoreCreeps = false) =>
  calculateAdjacentPositions(pos).filter(p => isPositionWalkable(p, ignoreCreeps));

export const calculateNearbyPositions = memoize(
  (pos: RoomPosition, proximity: number, includeCenter = false) => `${pos}x${proximity} ${includeCenter}`,
  (pos: RoomPosition, proximity: number, includeCenter = false) => {
    let adjacent: RoomPosition[] = [];
    adjacent = calculateAdjacencyMatrix(proximity)
      .map(offset => {
        try {
          return new RoomPosition(pos.x + offset.x, pos.y + offset.y, pos.roomName);
        } catch {
          return null;
        }
      })
      .filter(roomPos => roomPos !== null) as RoomPosition[];
    if (includeCenter) adjacent.push(pos);
    return adjacent;
  }
);
export const isPositionWalkable = memoizeByTick(
  (pos: RoomPosition, ignoreCreeps: boolean = false, ignoreStructures: boolean = false) =>
    pos.toString() + ignoreCreeps + ignoreStructures,
  (pos: RoomPosition, ignoreCreeps: boolean = false, ignoreStructures: boolean = false) => {
    let terrain;
    try {
      terrain = Game.map.getRoomTerrain(pos.roomName);
    } catch {
      // Invalid room
      return false;
    }
    if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
      return false;
    }
    if (
      Game.rooms[pos.roomName] &&
      pos.look().some(obj => {
        if (!ignoreCreeps && obj.type === LOOK_CREEPS) return true;
        if (
          !ignoreStructures &&
          obj.constructionSite &&
          (OBSTACLE_OBJECT_TYPES as string[]).includes(obj.constructionSite.structureType)
        )
          return true;
        if (
          !ignoreStructures &&
          obj.structure &&
          (OBSTACLE_OBJECT_TYPES as string[]).includes(obj.structure.structureType)
        )
          return true;
        return false;
      })
    ) {
      return false;
    }
    return true;
  }
);

export const isHighway = (roomName: string) => {
  let parsed = roomName.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
  if (!parsed) throw new Error("Invalid room name");
  return Number(parsed[1]) % 10 === 0 || Number(parsed[2]) % 10 === 0;
};
export const isSourceKeeperRoom = (roomName: string) => {
  let parsed = roomName.match(/^[WE]([0-9]+)[NS]([0-9]+)$/);
  if (!parsed) throw new Error("Invalid room name");
  let fmod = Number(parsed[1]) % 10;
  let smod = Number(parsed[2]) % 10;
  // return !(fmod === 5 && smod === 5) && (fmod >= 4 && fmod <= 6) && (smod >= 4 && smod <= 6);
  return fmod >= 4 && fmod <= 6 && smod >= 4 && smod <= 6;
};
export function lookForNear(pos: RoomPosition, range = 1, lookFor: LookConstant) {
    return Game.rooms[pos.roomName].lookForAtArea(
      lookFor,
      Math.max(1, Math.min(49, pos.y - range)),
      Math.max(1, Math.min(49, pos.x - range)),
      Math.max(1, Math.min(49, pos.y + range)),
      Math.max(1, Math.min(49, pos.x + range)),
      true
    );
}
export function lookNear(pos: RoomPosition, range = 1) {
  return Game.rooms[pos.roomName].lookAtArea(
    Math.max(1, Math.min(49, pos.y - range)),
    Math.max(1, Math.min(49, pos.x - range)),
    Math.max(1, Math.min(49, pos.y + range)),
    Math.max(1, Math.min(49, pos.x + range)),
    true
  );
}

export const terrainCostAt = (pos: RoomPosition) => {
  const terrain = Game.map.getRoomTerrain(pos.roomName).get(pos.x, pos.y);
  if (terrain === TERRAIN_MASK_SWAMP) return 5;
  if (terrain === TERRAIN_MASK_WALL) return 255;
  return 1;
};

export const findClosestByPath = (pos1: RoomPosition, targets: RoomPosition[]) => {
  const route = PathFinder.search(
    pos1,
    targets.map(pos => ({ pos, range: 1 })),
    {
      plainCost: 1,
      swampCost: 5,
      maxOps: 10000
    }
  );
  return targets.find(pos => pos.isNearTo(route.path[route.path.length - 1]));
};
