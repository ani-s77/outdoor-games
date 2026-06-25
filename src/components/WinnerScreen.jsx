import Avatar from './Avatar.jsx';

function WinnerScreen({ winner, playerWon, selectedPlayer, onRestart }) {
  const displayCharacter = playerWon ? winner : selectedPlayer || winner || { avatar: 'OUT' };
  const title = playerWon
    ? winner.winnerLine
    : selectedPlayer
      ? `HOST: ${selectedPlayer.name.toUpperCase()} OUT!`
      : 'HOST: EVERYBODY OUT!';
  const detail = playerWon
    ? `${winner.name} survived the backyard.`
    : winner
      ? `${winner.name} is still alive.`
      : 'Nobody survived that round.';

  return (
    <section className="screen winner-screen">
      <div className="winner-card">
        <p className="eyebrow">{playerWon ? 'Final call' : 'You lost'}</p>
        <Avatar character={displayCharacter} size="trophy" />
        <h1>{title}</h1>
        <p>{detail}</p>
        <button className="primary-button" type="button" onClick={onRestart}>
          Restart
        </button>
      </div>
    </section>
  );
}

export default WinnerScreen;
