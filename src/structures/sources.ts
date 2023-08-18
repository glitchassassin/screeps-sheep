import { RoomPositionSet } from "utils/RoomPositionSet";
import { memoizeByTick, memoizeOncePerTick } from "utils/memoize";
import { packNumber, packPos, unpackNumber, unpackPos } from "utils/packPositions";

declare global {
  interface Memory {
    sources: string;
    exploredRooms: string;
  }
}

Memory.sources ??= "";
Memory.exploredRooms ??= "";

export const getSourceByCachedPos = memoizeByTick(
  (pos: RoomPosition) => pos.__packedPos.toString(),
  (pos: RoomPosition) => {
    if (avoidSources.has(pos) || !Game.rooms[pos.roomName]) return;
    const source = pos.lookFor(LOOK_SOURCES)[0];
    return source;
  }
);

export const getCachedSourcesPositions = memoizeOncePerTick(() => {
  return (
    Memory.sources.match(/.{1,3}/g)?.map(s => ({
      pos: unpackPos(s.slice(0, 2)),
      range: unpackNumber(s.slice(2))
    })) ?? []
  );
});

export const avoidSources = new RoomPositionSet();

export function sources() {
  const sourcePositions = getCachedSourcesPositions();
  for (const room in Game.rooms) {
    if (!Memory.exploredRooms.includes(room)) {
      Memory.exploredRooms += room;
    }
    const sources = Game.rooms[room].find(FIND_SOURCES);
    for (const source of sources) {
      if (!sourcePositions.some(s => s.pos.isEqualTo(source.pos))) {
        // measure path distance to closest spawn
        const pathfinding = PathFinder.search(
          source.pos,
          Object.values(Game.spawns).map(s => ({
            pos: s.pos,
            range: 0
          }))
        );

        if (pathfinding.incomplete) {
          avoidSources.add(source.pos);
        }

        Memory.sources += packPos(source.pos) + packNumber(pathfinding.cost);
        sourcePositions.push({
          pos: source.pos,
          range: pathfinding.cost
        });
      }
    }
  }
}
