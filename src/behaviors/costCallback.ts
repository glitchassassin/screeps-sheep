import { calculateNearbyPositions } from "utils/MapCoordinates"
import { memoizeByTick } from "utils/memoize"

export const costCallback = memoizeByTick(
  roomName => roomName,
  (roomName: string, costMatrix: CostMatrix) => {
    // avoid hostile creeps
    for (const creep of Game.rooms[roomName]?.find(FIND_HOSTILE_CREEPS) ?? []) {
      calculateNearbyPositions(creep.pos, 3, true).forEach(pos => {
        costMatrix.set(pos.x, pos.y, 255)
      })
    }
  }
)
