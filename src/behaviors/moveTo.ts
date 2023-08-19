export function moveTo(creep: Creep, ...args: Parameters<Creep["moveTo"]>) {
  // move every other tick, unless on a room edge
  if (Game.time % 2 === 0 || creep.pos.x === 0 || creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
    return creep.moveTo(...args);
  }
  return ERR_TIRED;
}
