declare global {
  interface CreepMemory {
    state?: string;
  }
}

export function runStates<ExtraStates extends string, States extends string>(
  states: Record<States | ExtraStates, (creep: Creep) => States>,
  creep: Creep
) {
  const statesRun: string[] = [];
  let state = (creep.memory.state ?? Object.keys(states)[0]) as States | ExtraStates; // First state is default
  creep.memory.state = state;
  while (!statesRun.includes(state)) {
    statesRun.push(state);
    if (!(state in states)) {
      delete creep.memory.state;
      throw new Error(`Mission has no state: ${state}`);
    }
    state = states[state](creep);
    creep.memory.state = state;
  }
}
