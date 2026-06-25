import { CHARACTERS } from '../data/characters.js';

export const LANES = [
  { id: 0, command: 'Joe Biden', shortLabel: 'Biden' },
  { id: 1, command: 'America', shortLabel: 'America' },
  { id: 2, command: 'Trump', shortLabel: 'Trump' }
];

export const COMMANDS = LANES.map((lane) => lane.command);
const LANE_BY_COMMAND = Object.fromEntries(LANES.map((lane) => [lane.command, lane.id]));

export const DIRECTION_CONTROLS = [
  { id: 'double-left', label: '2 Left', symbol: '⇐', delta: -2, requiresDoubleJump: true },
  { id: 'left', label: 'Left', symbol: '←', delta: -1 },
  { id: 'right', label: 'Right', symbol: '→', delta: 1 },
  { id: 'double-right', label: '2 Right', symbol: '⇒', delta: 2, requiresDoubleJump: true }
];

const DELTA_BY_DIRECTION = Object.fromEntries(
  DIRECTION_CONTROLS.map((control) => [control.id, control.delta])
);

export const TRAP_PATTERNS = [
  ['America', 'Trump', 'America', 'Trump', 'America', 'Trump', 'America', 'Joe Biden'],
  ['America', 'Joe Biden', 'America', 'Joe Biden', 'America', 'Joe Biden', 'America', 'Trump'],
  ['America', 'Trump', 'America', 'Joe Biden', 'America', 'Trump', 'America', 'America'],
  ['America', 'Joe Biden', 'America', 'Trump', 'America', 'Joe Biden', 'America', 'America'],
  ['America', 'Trump', 'America', 'Joe Biden', 'America', 'Trump', 'America', 'Joe Biden', 'Joe Biden'],
  ['America', 'Joe Biden', 'America', 'Trump', 'America', 'Joe Biden', 'America', 'Trump', 'Trump'],
  ['America', 'Trump', 'America', 'Trump', 'America', 'Trump', 'America', 'America'],
  ['America', 'Trump', 'America', 'Trump', 'America', 'Trump', 'America', 'Trump', 'Trump'],
  ['America', 'Joe Biden', 'America', 'Joe Biden', 'America', 'Joe Biden', 'America', 'America'],
  [
    'America',
    'Joe Biden',
    'America',
    'Joe Biden',
    'America',
    'Joe Biden',
    'America',
    'Joe Biden',
    'Joe Biden'
  ]
];

export const createInitialPlayers = (selectedId) =>
  CHARACTERS.map((character) => ({
    ...character,
    lane: 1,
    alive: true,
    pendingOut: false,
    isUser: character.id === selectedId,
    cheatingWarnings: 0,
    eliminatedReason: ''
  }));

const getDifficultyCurve = (roundNumber, eliminatedCount = 0) => {
  const roundProgress = Math.max(0, roundNumber - 1) / 18;
  const curvedRoundPressure = 1 - Math.exp(-Math.pow(roundProgress, 2));
  const eliminationPressure = Math.min(0.18, eliminatedCount * 0.025);

  return Math.min(0.92, curvedRoundPressure + eliminationPressure);
};

export const resolveReactionTime = (character, roundNumber = 1, eliminatedCount = 0) => {
  const minReactionTime = character.minReactionTime ?? 1;

  if (Array.isArray(character.reactionTime)) {
    const [min, max] = character.reactionTime;
    const baseTime = min + Math.random() * (max - min);
    const difficulty = getDifficultyCurve(roundNumber, eliminatedCount);
    return Number(Math.max(minReactionTime, minReactionTime + (baseTime - minReactionTime) * (1 - difficulty)).toFixed(2));
  }

  const difficulty = getDifficultyCurve(roundNumber, eliminatedCount);
  return Number(
    Math.max(
      minReactionTime,
      minReactionTime + (character.reactionTime - minReactionTime) * (1 - difficulty)
    ).toFixed(2)
  );
};

export const moveForCommand = (lane, command, doubleJumpsActive = false) => {
  const targetLane = LANE_BY_COMMAND[command];

  if (targetLane === undefined) {
    return { lane, eliminated: true };
  }

  if (Math.abs(targetLane - lane) > (doubleJumpsActive ? 2 : 1)) {
    return { lane, eliminated: true };
  }

  if (targetLane === lane) {
    return { lane, eliminated: false };
  }

  return {
    lane: doubleJumpsActive ? targetLane : lane + Math.sign(targetLane - lane),
    eliminated: false
  };
};

export const getTargetLaneForCommand = (command) => LANE_BY_COMMAND[command];

export const moveForDirection = (lane, direction, doubleJumpsActive = false) => {
  const delta = DELTA_BY_DIRECTION[direction];
  const control = DIRECTION_CONTROLS.find((item) => item.id === direction);

  if (delta === undefined || (control?.requiresDoubleJump && !doubleJumpsActive)) {
    return { lane, eliminated: true };
  }

  const nextLane = lane + delta;
  if (nextLane < 0 || nextLane > 2) {
    return { lane, eliminated: true };
  }

  return { lane: nextLane, eliminated: false };
};

export const canMoveDirection = (lane, direction, doubleJumpsActive = false) => {
  const delta = DELTA_BY_DIRECTION[direction];
  const control = DIRECTION_CONTROLS.find((item) => item.id === direction);
  const nextLane = lane + delta;
  return (
    delta !== undefined &&
    (!control?.requiresDoubleJump || doubleJumpsActive) &&
    nextLane >= 0 &&
    nextLane <= 2
  );
};

export const isCommandReachable = (lane, command, doubleJumpsActive = false) => {
  const targetLane = LANE_BY_COMMAND[command];
  return targetLane !== undefined && Math.abs(targetLane - lane) <= (doubleJumpsActive ? 2 : 1);
};

const getReachableCommands = (lane, doubleJumpsActive = false) =>
  COMMANDS.filter((command) => isCommandReachable(lane, command, doubleJumpsActive));

const chooseReachableCommand = (lane, doubleJumpsActive = false) => {
  const commands = getReachableCommands(lane, doubleJumpsActive);
  return commands[Math.floor(Math.random() * commands.length)];
};

const getCommandsReachableForPlayers = (players, doubleJumpsActive = false) =>
  COMMANDS.filter((command) =>
    players.every((player) => isCommandReachable(player.lane, command, doubleJumpsActive))
  );

const chooseWrongNpcMove = (lane, correctLane, doubleJumpsActive = false) => {
  const candidateLanes = doubleJumpsActive ? [lane - 2, lane - 1, lane, lane + 1, lane + 2] : [lane - 1, lane, lane + 1];
  const validWrongLanes = candidateLanes.filter(
    (nextLane) => nextLane >= 0 && nextLane <= 2 && nextLane !== correctLane
  );

  return validWrongLanes[Math.floor(Math.random() * validWrongLanes.length)] ?? lane;
};

const makeChoiceReachable = (choice, alivePlayers, userLane, doubleJumpsActive = false) => {
  const reachableForEveryone =
    alivePlayers.length === 0 ||
    alivePlayers.every((player) => isCommandReachable(player.lane, choice.command, doubleJumpsActive));

  if (
    reachableForEveryone &&
    (userLane === undefined || isCommandReachable(userLane, choice.command, doubleJumpsActive))
  ) {
    return choice;
  }

  const sharedCommands = getCommandsReachableForPlayers(alivePlayers, doubleJumpsActive);
  const fallbackCommands =
    sharedCommands.length > 0 ? sharedCommands : getReachableCommands(userLane, doubleJumpsActive);

  return {
    command:
      fallbackCommands[Math.floor(Math.random() * fallbackCommands.length)] ||
      chooseReachableCommand(1, doubleJumpsActive),
    trapType: 'normal',
    patternState: null
  };
};

export const chooseRoundCommand = ({
  roundNumber,
  patternState,
  players,
  lastHadElimination,
  userLane,
  doubleJumpsActive = false
}) => {
  const alive = players.filter((player) => player.alive);
  const allOnRight = alive.length > 0 && alive.every((player) => player.lane === 2);
  const allOnLeft = alive.length > 0 && alive.every((player) => player.lane === 0);
  const sideHeavy =
    alive.length > 1 &&
    (alive.filter((player) => player.lane === 2).length >= Math.ceil(alive.length * 0.65) ||
      alive.filter((player) => player.lane === 0).length >= Math.ceil(alive.length * 0.65));

  if (lastHadElimination && allOnRight && Math.random() < 0.75) {
    return makeChoiceReachable(
      { command: 'Trump', trapType: 'repeat-side', patternState: null },
      alive,
      userLane,
      doubleJumpsActive
    );
  }

  if (lastHadElimination && allOnLeft && Math.random() < 0.75) {
    return makeChoiceReachable(
      { command: 'Joe Biden', trapType: 'repeat-side', patternState: null },
      alive,
      userLane,
      doubleJumpsActive
    );
  }

  if (lastHadElimination && sideHeavy && Math.random() < 0.18) {
    const rightCount = alive.filter((player) => player.lane === 2).length;
    const leftCount = alive.filter((player) => player.lane === 0).length;
    return makeChoiceReachable(
      {
        command: rightCount >= leftCount ? 'Trump' : 'Joe Biden',
        trapType: 'repeat-side',
        patternState: null
      },
      alive,
      userLane,
      doubleJumpsActive
    );
  }

  if (patternState && patternState.index < patternState.pattern.length) {
    const nextIndex = patternState.index + 1;
    return makeChoiceReachable(
      {
        command: patternState.pattern[patternState.index],
        trapType: 'pattern',
        trapProgress: nextIndex / patternState.pattern.length,
        patternState: { ...patternState, index: nextIndex }
      },
      alive,
      userLane,
      doubleJumpsActive
    );
  }

  if (roundNumber > 1 && Math.random() < 0.38) {
    const pattern = TRAP_PATTERNS[Math.floor(Math.random() * TRAP_PATTERNS.length)];
    return makeChoiceReachable(
      {
        command: pattern[0],
        trapType: 'pattern',
        trapProgress: 1 / pattern.length,
        patternState: { pattern, index: 1 }
      },
      alive,
      userLane,
      doubleJumpsActive
    );
  }

  return makeChoiceReachable(
    {
      command: COMMANDS[Math.floor(Math.random() * COMMANDS.length)],
      trapType: 'normal',
      patternState: null
    },
    alive,
    userLane,
    doubleJumpsActive
  );
};

export const simulateNpcRound = ({
  players,
  userId,
  command,
  trapType,
  lastHadElimination,
  trapProgress = 0,
  doubleJumpsActive = false
}) => {
  const eliminatedIds = [];
  const eliminationCandidates = [];

  const movedPlayers = players.map((player) => {
    if (!player.alive || player.id === userId) {
      return player;
    }

    const movement = moveForCommand(player.lane, command, doubleJumpsActive);
    let failChance = player.npcFailChance * 0.5;

    // NPC difficulty stays mostly flat so the player timer carries the late-game pressure.
    if (trapType === 'pattern') {
      failChance += player.trapPenalty * (0.01 + trapProgress * 0.12) + 0.002 + trapProgress * 0.01;
    }
    if (trapType === 'repeat-side') {
      failChance += player.trapPenalty * 0.015 + 0.0025;
    }
    if (doubleJumpsActive && Math.abs(movement.lane - player.lane) === 2) {
      failChance += player.trapPenalty * 0.9 + 0.05;
    }
    if (lastHadElimination) {
      failChance += player.trapPenalty * 0.005;
    }
    const cappedFailChance = movement.eliminated ? failChance : Math.min(failChance, 0.18);
    const failedReaction = Math.random() < cappedFailChance;

    if (failedReaction) {
      const wrongLane = chooseWrongNpcMove(player.lane, movement.lane, doubleJumpsActive);
      eliminationCandidates.push({
        id: player.id,
        lane: wrongLane,
        reason: movement.eliminated ? 'boundary' : 'reaction'
      });
    }

    return { ...player, lane: movement.lane };
  });

  const maxNpcEliminations = 1;
  const selectedCandidates = eliminationCandidates
    .sort(() => Math.random() - 0.5)
    .slice(0, maxNpcEliminations);
  const selectedIds = new Set(selectedCandidates.map((candidate) => candidate.id));
  const candidateById = new Map(selectedCandidates.map((candidate) => [candidate.id, candidate]));

  const updatedPlayers = movedPlayers.map((player) => {
    if (!selectedIds.has(player.id)) {
      return player;
    }

    eliminatedIds.push(player.id);
    return {
      ...player,
      lane: candidateById.get(player.id).lane,
      pendingOut: true,
      eliminatedReason: candidateById.get(player.id).reason
    };
  });

  return { players: updatedPlayers, eliminatedIds };
};

export const applyUserMove = ({ players, userId, command, expectedCommand, doubleJumpsActive = false }) => {
  let eliminatedId = null;
  const targetLane = getTargetLaneForCommand(expectedCommand);

  const updatedPlayers = players.map((player) => {
    if (!player.alive || player.id !== userId) {
      return player;
    }

    const userMove = moveForDirection(player.lane, command, doubleJumpsActive);
    if (userMove.eliminated || userMove.lane !== targetLane) {
      eliminatedId = player.id;
      return {
        ...player,
        lane: userMove.lane,
        pendingOut: true,
        eliminatedReason: userMove.eliminated ? 'boundary' : 'wrong-input'
      };
    }

    return { ...player, lane: userMove.lane };
  });

  return { players: updatedPlayers, eliminatedId };
};

export const applyUserTimeout = ({ players, userId, expectedCommand }) => {
  let eliminatedId = null;
  const targetLane = getTargetLaneForCommand(expectedCommand);

  const updatedPlayers = players.map((player) => {
    if (player.alive && player.id === userId && player.lane !== targetLane) {
      eliminatedId = player.id;
      return { ...player, pendingOut: true, eliminatedReason: 'timeout' };
    }

    return player;
  });

  return { players: updatedPlayers, eliminatedId };
};

export const addCheatingWarning = ({ players, userId }) => {
  let eliminatedId = null;
  let warnings = 0;

  const updatedPlayers = players.map((player) => {
    if (player.id !== userId || player.special !== 'cheating-risk' || !player.alive) {
      return player;
    }

    warnings = player.cheatingWarnings + 1;
    if (warnings >= 2) {
      eliminatedId = player.id;
      return {
        ...player,
        cheatingWarnings: warnings,
        pendingOut: true,
        eliminatedReason: 'cheating'
      };
    }

    return { ...player, cheatingWarnings: warnings };
  });

  return { players: updatedPlayers, eliminatedId, warnings };
};
