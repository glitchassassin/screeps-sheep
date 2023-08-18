export function runAwayFromEnemies(creep: Creep) {
  const threatVector = {
    x: 0,
    y: 0
  };
  let threat = false;
  for (const t of creep.room.lookForAtArea(
    LOOK_CREEPS,
    Math.max(1, Math.min(49, creep.pos.y - 3)),
    Math.max(1, Math.min(49, creep.pos.x - 3)),
    Math.max(1, Math.min(49, creep.pos.y + 3)),
    Math.max(1, Math.min(49, creep.pos.x + 3)),
    true
  )) {
    if (t.creep.my) continue;
    threat = true;
    threatVector.x += t.x - creep.pos.x
    threatVector.y += t.y - creep.pos.y
  }
  if (!threat) return false;
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
  creep.move(creep.pos.getDirectionTo(fleePos))
  return true
}
