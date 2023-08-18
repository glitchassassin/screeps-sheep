export function spawn() {
  for (const spawn in Game.spawns) {
    Game.spawns[spawn].spawnCreep(
      [WORK, CARRY, MOVE],
      "Sheep-" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0"),
      { memory: { room: Game.spawns[spawn].pos.roomName } }
    )
  }
}
