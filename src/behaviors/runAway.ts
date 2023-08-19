import { FLEE_RANGE } from "utils/constants";

const ranAwayFromEnemy = new Map<string, number>();

export function runAwayFromEnemies(creep: Creep) {
  const threatVector = {
    x: 0,
    y: 0
  };
  let threat = false;
  for (const t of creep.room.lookForAtArea(
    LOOK_CREEPS,
    Math.max(1, Math.min(49, creep.pos.y - FLEE_RANGE)),
    Math.max(1, Math.min(49, creep.pos.x - FLEE_RANGE)),
    Math.max(1, Math.min(49, creep.pos.y + FLEE_RANGE)),
    Math.max(1, Math.min(49, creep.pos.x + FLEE_RANGE)),
    true
  )) {
    if (t.creep.my) continue;
    threat = true;
    threatVector.x += t.x - creep.pos.x
    threatVector.y += t.y - creep.pos.y
  }

  if (!threat) {
    // if is on edge tile and fled last tick, move off edge tile
    const lastFled = ranAwayFromEnemy.get(creep.name) ?? 0
    if (Game.time - lastFled === 1) {
      if (creep.pos.x === 0) {
        creep.move(RIGHT);
        ranAwayFromEnemy.set(creep.name, Game.time);
      } else if (creep.pos.x === 49) {
        creep.move(LEFT);
        ranAwayFromEnemy.set(creep.name, Game.time);
      } else if (creep.pos.y === 0) {
        creep.move(BOTTOM);
        ranAwayFromEnemy.set(creep.name, Game.time);
      } else if (creep.pos.y === 49) {
        creep.move(TOP);
        ranAwayFromEnemy.set(creep.name, Game.time);
      }
      // if not on edge tile but we fled recently, wait a tick
      return true;
    }
    return false;
  }

  if (threatVector.x === 0 && threatVector.y === 0) return; // don't move
  // get flee vector
  const fleeVector = {
    x: -Math.round(threatVector.x / Math.max(Math.abs(threatVector.x), Math.abs(threatVector.y))),
    y: -Math.round(threatVector.y / Math.max(Math.abs(threatVector.x), Math.abs(threatVector.y)))
  }
  if (fleeVector.x === 0 && fleeVector.y === 0) return; // don't move
  // move in that direction
  const fleePos = new RoomPosition(
    Math.max(0, Math.min(49, creep.pos.x + fleeVector.x)),
    Math.max(0, Math.min(49, creep.pos.y + fleeVector.y)),
    creep.pos.roomName
  )
  creep.move(creep.pos.getDirectionTo(fleePos));
  ranAwayFromEnemy.set(creep.name, Game.time);
  return true
}
