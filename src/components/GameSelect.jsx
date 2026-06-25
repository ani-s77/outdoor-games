import { GAMES } from '../data/games.js';

function GameSelect({ onSelect }) {
  return (
    <section className="screen game-select-screen">
      <div className="screen-header game-library-header">
        <p className="eyebrow">Game shelf</p>
        <h1>Outdoor Games</h1>
      </div>

      <div className="game-list" aria-label="Games">
        {GAMES.map((game) => (
          <button
            className={`game-card ${game.accentClass}`}
            type="button"
            key={game.id}
            onClick={() => onSelect(game.id)}
          >
            <span className="game-card-art" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="game-card-copy">
              <span className="game-status">{game.status}</span>
              <strong>{game.title}</strong>
              <span>{game.summary}</span>
            </span>
            <span className="game-card-meta">
              <span>{game.playerCount}</span>
              <span>{game.rosterSize}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default GameSelect;
