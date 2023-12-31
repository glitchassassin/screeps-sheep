import { calculateNearbyPositions } from "utils/MapCoordinates"
import { FLEE_RANGE } from "utils/constants"
import { memoizeByTick } from "utils/memoize"

export const costCallback = memoizeByTick(
  roomName => roomName,
  (roomName: string, costMatrix: CostMatrix) => {
    // avoid hostile creeps
    for (const creep of Game.rooms[roomName]?.find(FIND_HOSTILE_CREEPS) ?? []) {
      calculateNearbyPositions(creep.pos, FLEE_RANGE, true).forEach(pos => {
        costMatrix.set(pos.x, pos.y, 255)
      })
    }
  }
)
