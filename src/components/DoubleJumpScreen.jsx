function DoubleJumpScreen({ onContinue }) {
  return (
    <section className="screen double-jump-screen">
      <div className="winner-card">
        <p className="eyebrow">Final 3</p>
        <h1>Double jumps are active</h1>
        <p>Two-lane jumps are now available from the side lanes.</p>
        <button className="primary-button" type="button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </section>
  );
}

export default DoubleJumpScreen;
