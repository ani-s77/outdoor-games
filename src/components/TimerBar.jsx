function TimerBar({ duration, roundKey, active, showCheatingZone }) {
  return (
    <div
      className={`timer-shell ${showCheatingZone ? 'has-cheating-zone' : ''}`}
      aria-label="Reaction timer"
    >
      {showCheatingZone && <div className="cheating-zone" aria-hidden="true" />}
      <div
        key={roundKey}
        className={`timer-fill ${active ? 'is-active' : ''}`}
        style={{ animationDuration: `${duration}s` }}
      />
    </div>
  );
}

export default TimerBar;
