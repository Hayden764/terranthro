const OpacitySlider = ({ value, onChange }) => {
  return (
    <div className="opacity-slider">
      <label className="opacity-slider-label">
        Opacity: {Math.round(value * 100)}%
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="opacity-slider-input"
      />
    </div>
  );
};

export default OpacitySlider;
