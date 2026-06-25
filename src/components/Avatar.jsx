function Avatar({ character, size = '' }) {
  const className = `avatar ${size}`.trim();

  if (character.avatarImage) {
    return (
      <span className={`${className} image-avatar`}>
        <img src={character.avatarImage} alt={`${character.name} avatar`} />
      </span>
    );
  }

  return <span className={className}>{character.avatar}</span>;
}

export default Avatar;
