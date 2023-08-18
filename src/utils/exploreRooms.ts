import { isSourceKeeperRoom } from "./MapCoordinates";
import { memoize } from "./memoize";

const cachedRoomStatus = memoize(
  room => room,
  (room: string) => Game.map.getRoomStatus(room).status,
  100
);

export const getExploreRooms = memoize(
  origin => origin,
  (origin: string) => {
    const maxRange = 5;
    const frontier: string[] = [origin];
    const status = cachedRoomStatus(origin);
    const patrolRoomsWithDistance = new Map<string, number>();
    patrolRoomsWithDistance.set(origin, 0);

    if (status === "closed") return [];

    let room;
    while ((room = frontier.shift())) {
      const exits = Game.map.describeExits(room);
      let distance = patrolRoomsWithDistance.get(room)! + 1;
      if (distance > maxRange) {
        continue;
      }
      for (const exit of Object.values(exits)) {
        // avoid zone boundaries and source keeper rooms
        if (cachedRoomStatus(exit) !== status || isSourceKeeperRoom(exit)) continue;

        if (!patrolRoomsWithDistance.has(exit)) {
          frontier.push(exit);
          patrolRoomsWithDistance.set(exit, distance);
        } else {
          distance = Math.min(distance, patrolRoomsWithDistance.get(exit)! + 1);
        }
      }
      patrolRoomsWithDistance.set(room, distance);
    }

    // sort by distance
    return [...patrolRoomsWithDistance.entries()].sort((a, b) => a[1] - b[1]).map(([room]) => room);
  }
);
