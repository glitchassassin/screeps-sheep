interface ScoreSegment {
  scores: {
    u: string,
    s: number
  }[]
}

RawMemory.setPublicSegments([0]);
RawMemory.setActiveSegments([0]);
const currentScores = new Map<string, number>();
let memoryLoaded = false;

export function scoreSheep() {
  if (!memoryLoaded && RawMemory.segments[0] !== undefined) {
    // load score and add to last tick's score if needed following global reset
    if (RawMemory.segments[0] !== '') {
      for (const score of JSON.parse(RawMemory.segments[0]).scores as ScoreSegment["scores"]) {
        currentScores.set(score.u, (currentScores.get(score.u) ?? 0) + score.s)
      }
    }
    memoryLoaded = true;
  }
  // score creeps next to spawns
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const adjacentSpawn = creep.room.find(FIND_HOSTILE_SPAWNS).find(s => s.pos.isNearTo(creep.pos) && s.owner?.username === s.room.controller?.owner?.username);
    if (adjacentSpawn) {
      currentScores.set(adjacentSpawn.owner.username, (currentScores.get(adjacentSpawn.owner.username) ?? 0) + 1)
      creep.suicide();
    }
  }
  RawMemory.segments[0] = JSON.stringify({
    scores: [
      ...currentScores.entries()
    ].map(([u, s]) => ({u, s}))
  })
}
