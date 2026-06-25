import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CharacterSelect from './components/CharacterSelect.jsx';
import DoubleJumpScreen from './components/DoubleJumpScreen.jsx';
import GameSelect from './components/GameSelect.jsx';
import GameScreen from './components/GameScreen.jsx';
import WinnerScreen from './components/WinnerScreen.jsx';
import { getGameById } from './data/games.js';
import {
  addCheatingWarning,
  applyUserMove,
  applyUserTimeout,
  chooseRoundCommand,
  createInitialPlayers,
  getTargetLaneForCommand,
  resolveReactionTime,
  simulateNpcRound
} from './utils/gameLogic.js';

const WRONG_MOVE_DELAY = 1500;
const ELIMINATION_SPEECH_DELAY = 1500;
const CHEATING_WARNING_DELAY = 1000;
const NEXT_ROUND_DELAY = 400;

function App() {
  const [screen, setScreen] = useState('game-select');
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [command, setCommand] = useState('');
  const [reactionTime, setReactionTime] = useState(1.5);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [hostMessage, setHostMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [winner, setWinner] = useState(null);
  const [playerWon, setPlayerWon] = useState(false);
  const [patternState, setPatternState] = useState(null);
  const [lastHadElimination, setLastHadElimination] = useState(false);
  const [trapType, setTrapType] = useState('normal');
  const [trapProgress, setTrapProgress] = useState(0);
  const [doubleJumpsActive, setDoubleJumpsActive] = useState(false);

  const timersRef = useRef([]);
  const playersRef = useRef(players);
  const commandRef = useRef(command);
  const awaitingRef = useRef(awaitingInput);
  const selectedIdRef = useRef(selectedId);
  const roundNumberRef = useRef(roundNumber);
  const patternStateRef = useRef(patternState);
  const lastHadEliminationRef = useRef(lastHadElimination);
  const trapTypeRef = useRef(trapType);
  const trapProgressRef = useRef(trapProgress);
  const doubleJumpsActiveRef = useRef(doubleJumpsActive);
  const reactionTimeRef = useRef(reactionTime);
  const roundStartedAtRef = useRef(0);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    commandRef.current = command;
  }, [command]);

  useEffect(() => {
    awaitingRef.current = awaitingInput;
  }, [awaitingInput]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    roundNumberRef.current = roundNumber;
  }, [roundNumber]);

  useEffect(() => {
    patternStateRef.current = patternState;
  }, [patternState]);

  useEffect(() => {
    lastHadEliminationRef.current = lastHadElimination;
  }, [lastHadElimination]);

  useEffect(() => {
    trapTypeRef.current = trapType;
  }, [trapType]);

  useEffect(() => {
    trapProgressRef.current = trapProgress;
  }, [trapProgress]);

  useEffect(() => {
    doubleJumpsActiveRef.current = doubleJumpsActive;
  }, [doubleJumpsActive]);

  useEffect(() => {
    reactionTimeRef.current = reactionTime;
  }, [reactionTime]);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedId),
    [players, selectedId]
  );
  const selectedGame = useMemo(() => getGameById(selectedGameId), [selectedGameId]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const queueTimer = useCallback((callback, delay) => {
    const timerId = window.setTimeout(callback, delay);
    timersRef.current.push(timerId);
    return timerId;
  }, []);

  const updatePlayers = useCallback((nextPlayers) => {
    playersRef.current = nextPlayers;
    setPlayers(nextPlayers);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const evaluateRoundEnd = useCallback(
    (nextPlayers, hadElimination) => {
      const alive = nextPlayers.filter((player) => player.alive && !player.pendingOut);
      const userStillAlive = alive.some((player) => player.id === selectedIdRef.current);

      if (!userStillAlive) {
        setWinner(alive[0] || null);
        setPlayerWon(false);
        setScreen('winner');
        return;
      }

      if (alive.length === 1) {
        setWinner(alive[0]);
        setPlayerWon(alive[0].id === selectedIdRef.current);
        setScreen('winner');
        return;
      }

      if (alive.length === 3 && !doubleJumpsActiveRef.current) {
        setDoubleJumpsActive(true);
        doubleJumpsActiveRef.current = true;
        setScreen('double-jump');
        return;
      }

      if (!hadElimination) {
        setAnnouncement('');
        setHostMessage('');
        commandRef.current = '';
        setCommand('');
        lastHadEliminationRef.current = false;
        setLastHadElimination(false);
        queueTimer(() => startRound(false), NEXT_ROUND_DELAY);
        return;
      }

      lastHadEliminationRef.current = true;
      patternStateRef.current = null;
      trapProgressRef.current = 0;
      setLastHadElimination(true);
      setPatternState(null);
      setTrapProgress(0);
      commandRef.current = '';
      setCommand('');
      setHostMessage('');
      queueTimer(() => {
        setAnnouncement('');
        startRound(true);
      }, NEXT_ROUND_DELAY);
    },
    [queueTimer]
  );

  const removeEliminatedPlayer = useCallback(
    (playersToUpdate, eliminatedId) => {
      const nextPlayers = playersToUpdate.map((player) =>
        player.id === eliminatedId ? { ...player, alive: false, pendingOut: false } : player
      );
      updatePlayers(nextPlayers);
      return nextPlayers;
    },
    [updatePlayers]
  );

  const finishRound = useCallback(
    (stagedPlayers, eliminatedIds, cheatingEvent = null) => {
      setAwaitingInput(false);
      commandRef.current = '';
      setCommand('');
      setHostMessage('');

      if (eliminatedIds.length === 0 && !cheatingEvent) {
        evaluateRoundEnd(stagedPlayers, false);
        return;
      }

      const initialDelay = eliminatedIds.length > 0 ? WRONG_MOVE_DELAY : 0;

      queueTimer(() => {
        let currentPlayers = playersRef.current;
        const outEvents = eliminatedIds.map((id) => ({ type: 'out', id }));
        const events = cheatingEvent ? [...outEvents, cheatingEvent] : outEvents;

        events.forEach((event, index) => {
          queueTimer(() => {
            if (event.type === 'out') {
              const eliminated = currentPlayers.find((player) => player.id === event.id);
              if (!eliminated) {
                return;
              }

              setAnnouncement(`HOST: ${eliminated.name.toUpperCase()} OUT!`);
              currentPlayers = removeEliminatedPlayer(currentPlayers, event.id);
            }

            if (event.type === 'cheating-warning') {
              setAnnouncement('Mr. Griddy no cheating');
            }

            if (event.type === 'cheating-out') {
              setAnnouncement('Mr. Griddy out, cheater, Mr. Griddy cheater');
              currentPlayers = removeEliminatedPlayer(currentPlayers, event.id);
            }

            if (index === events.length - 1) {
              queueTimer(() => {
                setAnnouncement('');
                if (events.length === 1 && event.type === 'cheating-warning') {
                  lastHadEliminationRef.current = false;
                  setLastHadElimination(false);
                  startRound(false);
                  return;
                }

                evaluateRoundEnd(playersRef.current, eliminatedIds.length > 0 || event.type === 'cheating-out');
              }, event.type === 'cheating-warning' ? CHEATING_WARNING_DELAY : ELIMINATION_SPEECH_DELAY);
            }
          }, index * ELIMINATION_SPEECH_DELAY);
        });
      }, initialDelay);
    },
    [evaluateRoundEnd, queueTimer, removeEliminatedPlayer]
  );

  const resolveRound = useCallback(
    (basePlayers, userEliminatedId = null, cheatingEvent = null) => {
      const { players: npcPlayers, eliminatedIds } = simulateNpcRound({
        players: basePlayers,
        userId: selectedIdRef.current,
        command: commandRef.current,
        trapType: trapTypeRef.current,
        lastHadElimination: lastHadEliminationRef.current,
        roundNumber: roundNumberRef.current,
        trapProgress: trapProgressRef.current,
        doubleJumpsActive: doubleJumpsActiveRef.current
      });

      const allEliminated = userEliminatedId ? [userEliminatedId, ...eliminatedIds] : eliminatedIds;
      updatePlayers(npcPlayers);
      const uniqueEliminated = [...new Set(allEliminated)];
      finishRound(npcPlayers, uniqueEliminated, cheatingEvent);
    },
    [finishRound, updatePlayers]
  );

  const startRound = useCallback(
    (previousRoundHadElimination = lastHadEliminationRef.current) => {
      clearTimers();
      setAnnouncement('');

      const nextRoundNumber = roundNumberRef.current + 1;
      const user = playersRef.current.find((player) => player.id === selectedIdRef.current);
      const choice = chooseRoundCommand({
        roundNumber: nextRoundNumber,
        patternState: patternStateRef.current,
        players: playersRef.current,
        lastHadElimination: previousRoundHadElimination,
        userLane: user?.lane,
        doubleJumpsActive: doubleJumpsActiveRef.current
      });
      const eliminatedCount = playersRef.current.filter((player) => !player.alive).length;
      const nextReactionTime = resolveReactionTime(user, nextRoundNumber, eliminatedCount);

      roundNumberRef.current = nextRoundNumber;
      patternStateRef.current = choice.patternState;
      trapTypeRef.current = choice.trapType;
      trapProgressRef.current = choice.trapProgress || 0;
      setRoundNumber(nextRoundNumber);
      setCommand(choice.command);
      setTrapType(choice.trapType);
      setPatternState(choice.patternState);
      setTrapProgress(choice.trapProgress || 0);
      setReactionTime(nextReactionTime);
      setHostMessage(choice.command);
      setAwaitingInput(true);
      reactionTimeRef.current = nextReactionTime;
      roundStartedAtRef.current = Date.now();

      queueTimer(() => {
        if (!awaitingRef.current) {
          return;
        }

        const { players: timedOutPlayers, eliminatedId } = applyUserTimeout({
          players: playersRef.current,
          userId: selectedIdRef.current,
          expectedCommand: commandRef.current
        });
        updatePlayers(timedOutPlayers);
        resolveRound(timedOutPlayers, eliminatedId);
      }, nextReactionTime * 1000);
    },
    [clearTimers, queueTimer, resolveRound, updatePlayers]
  );

  const beginGame = (characterId) => {
    clearTimers();
    const initialPlayers = createInitialPlayers(characterId);
    selectedIdRef.current = characterId;
    playersRef.current = initialPlayers;
    roundNumberRef.current = 0;
    patternStateRef.current = null;
    lastHadEliminationRef.current = false;
    trapTypeRef.current = 'normal';
    trapProgressRef.current = 0;
    doubleJumpsActiveRef.current = false;
    setSelectedId(characterId);
    updatePlayers(initialPlayers);
    setRoundNumber(0);
    setWinner(null);
    setPlayerWon(false);
    setPatternState(null);
    setTrapProgress(0);
    setDoubleJumpsActive(false);
    setLastHadElimination(false);
    setScreen('game');

    queueTimer(() => {
      startRound(false);
    }, 100);
  };

  const selectGame = (gameId) => {
    clearTimers();
    setSelectedGameId(gameId);
    setScreen('character-select');
  };

  const handleMove = (direction) => {
    if (!awaitingRef.current) {
      return;
    }

    const user = playersRef.current.find((player) => player.id === selectedIdRef.current);
    const targetLane = getTargetLaneForCommand(commandRef.current);
    const moveRequired = user && targetLane !== undefined && user.lane !== targetLane;
    const elapsedMs = Date.now() - roundStartedAtRef.current;
    const lateMove = elapsedMs >= reactionTimeRef.current * 1000 * 0.75;
    const shouldCheckCheating =
      user?.special === 'cheating-risk' && moveRequired && lateMove && Math.random() < 0.5;

    clearTimers();
    setAwaitingInput(false);
    const { players: movedPlayers, eliminatedId } = applyUserMove({
      players: playersRef.current,
      userId: selectedIdRef.current,
      command: direction,
      expectedCommand: commandRef.current,
      doubleJumpsActive: doubleJumpsActiveRef.current
    });

    if (shouldCheckCheating && !eliminatedId) {
      const { players: warnedPlayers, eliminatedId: cheatingEliminatedId, warnings } = addCheatingWarning({
        players: movedPlayers,
        userId: selectedIdRef.current
      });
      const cheatingEvent =
        warnings >= 2
          ? { type: 'cheating-out', id: selectedIdRef.current }
          : { type: 'cheating-warning' };

      updatePlayers(warnedPlayers);
      resolveRound(warnedPlayers, cheatingEliminatedId ? null : eliminatedId, cheatingEvent);
      return;
    }

    updatePlayers(movedPlayers);
    resolveRound(movedPlayers, eliminatedId);
  };

  const restart = () => {
    clearTimers();
    selectedIdRef.current = null;
    playersRef.current = [];
    roundNumberRef.current = 0;
    patternStateRef.current = null;
    lastHadEliminationRef.current = false;
    trapTypeRef.current = 'normal';
    trapProgressRef.current = 0;
    doubleJumpsActiveRef.current = false;
    setScreen('game-select');
    setSelectedGameId(null);
    setSelectedId(null);
    setPlayers([]);
    setRoundNumber(0);
    setCommand('');
    setReactionTime(1.5);
    setAwaitingInput(false);
    setHostMessage('');
    setAnnouncement('');
    setWinner(null);
    setPlayerWon(false);
    setPatternState(null);
    setLastHadElimination(false);
    setTrapType('normal');
    setTrapProgress(0);
    setDoubleJumpsActive(false);
  };

  const continueDoubleJump = () => {
    setScreen('game');
    queueTimer(() => {
      startRound(true);
    }, 100);
  };

  const backToGames = () => {
    clearTimers();
    setSelectedGameId(null);
    setSelectedId(null);
    setScreen('game-select');
  };

  if (screen === 'winner') {
    return (
      <WinnerScreen
        winner={winner}
        playerWon={playerWon}
        selectedPlayer={selectedPlayer}
        onRestart={restart}
      />
    );
  }

  if (screen === 'double-jump') {
    return <DoubleJumpScreen onContinue={continueDoubleJump} />;
  }

  if (screen === 'game' && selectedPlayer) {
    return (
      <GameScreen
        players={players}
        selectedPlayer={selectedPlayer}
        command={command}
        reactionTime={reactionTime}
        roundNumber={roundNumber}
        awaitingInput={awaitingInput}
        hostMessage={hostMessage}
        announcement={announcement}
        doubleJumpsActive={doubleJumpsActive}
        onMove={handleMove}
      />
    );
  }

  if (screen === 'character-select' && selectedGame) {
    return <CharacterSelect game={selectedGame} onBack={backToGames} onSelect={beginGame} />;
  }

  return <GameSelect onSelect={selectGame} />;
}

export default App;
