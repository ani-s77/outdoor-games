import { CHARACTERS } from '../data/characters.js';
import Avatar from './Avatar.jsx';

function CharacterSelect({ game, onBack, onSelect }) {
  return (
    <section className="screen character-select">
      <div className="screen-header character-select-header">
        <button className="back-button" type="button" onClick={onBack} aria-label="Back to games">
          ←
        </button>
        <p className="eyebrow">{game?.eyebrow || 'Choose your challenger'}</p>
        <h1>{game?.title || 'Backyard Jumping Challenge'}</h1>
      </div>

      <div className="character-grid">
        {CHARACTERS.map((character) => (
          <button
            className="character-card"
            type="button"
            key={character.id}
            onClick={() => onSelect(character.id)}
          >
            <Avatar character={character} size="large" />
            <strong>{character.name}</strong>
            <span>{character.note}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CharacterSelect;
