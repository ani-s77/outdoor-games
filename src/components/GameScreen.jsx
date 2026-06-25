import {
  canMoveDirection,
  DIRECTION_CONTROLS,
  LANES
} from '../utils/gameLogic.js';
import Avatar from './Avatar.jsx';
import TimerBar from './TimerBar.jsx';

function GameScreen({
  players,
  selectedPlayer,
  command,
  reactionTime,
  roundNumber,
  awaitingInput,
  hostMessage,
  announcement,
  doubleJumpsActive,
  onMove
}) {
  const alivePlayers = players.filter((player) => player.alive);
  const outPlayers = players.filter((player) => !player.alive);
  const showCheatingZone = selectedPlayer.special === 'cheating-risk';
  const visibleControls = DIRECTION_CONTROLS.filter(
    (control) => doubleJumpsActive || !control.requiresDoubleJump
  );

  return (
    <section className="screen game-screen">
      <div className="hud">
        <span>Round {roundNumber}</span>
        <span>Alive: {alivePlayers.length}/8</span>
      </div>

      <div className="host-area">
        <div className="host-avatar">Z</div>
        <div className="speech-bubble">
          <span>HOST</span>
          <strong>{announcement || hostMessage || command}</strong>
        </div>
      </div>

      <TimerBar
        duration={reactionTime}
        roundKey={`${roundNumber}-${command}`}
        active={awaitingInput}
        showCheatingZone={showCheatingZone}
      />

      <div className="status-strip">
        <span>
          You are <strong>{selectedPlayer.name}</strong>
        </span>
        {selectedPlayer.special === 'cheating-risk' && (
          <span>Warnings: {selectedPlayer.cheatingWarnings}/2</span>
        )}
      </div>

      <div className="lanes" aria-label="Backyard lanes">
        {LANES.map((lane) => (
          <div className="lane" key={lane.id}>
            <div className="lane-label">{lane.command}</div>
            <div className="lane-track">
              {players
                .filter((player) => player.alive && player.lane === lane.id)
                .map((player) => (
                  <div
                    className={`player-chip ${player.isUser ? 'is-user' : ''} ${
                      player.pendingOut ? 'is-pending-out' : ''
                    }`}
                    key={player.id}
                    title={player.name}
                  >
                    <Avatar character={player} />
                    <span>{player.name}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="out-section">
        <strong>OUT</strong>
        <div>
          {outPlayers.length === 0
            ? 'No one yet'
            : outPlayers.map((player) => (
                <span className="out-chip" key={player.id}>
                  {player.name}
                </span>
              ))}
        </div>
      </div>

      <div className={`controls ${doubleJumpsActive ? 'four-controls' : 'two-controls'}`}>
        {visibleControls.map((control) => (
          <button
            type="button"
            key={control.id}
            className={`direction-button ${control.id}`}
            disabled={
              !awaitingInput ||
              !selectedPlayer.alive ||
              selectedPlayer.pendingOut ||
              !canMoveDirection(selectedPlayer.lane, control.id, doubleJumpsActive)
            }
            onClick={() => onMove(control.id)}
            aria-label={`Move ${control.label}`}
          >
            <span className="control-symbol">{control.symbol}</span>
            <span>{control.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default GameScreen;
