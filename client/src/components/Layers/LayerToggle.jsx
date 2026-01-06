import { useState } from 'react';

const LayerToggle = ({ label, checked, onChange }) => {
  return (
    <div className="layer-toggle">
      <label className="layer-toggle-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="layer-toggle-checkbox"
        />
        <span className="layer-toggle-custom">
          <span className="layer-toggle-checkmark">✓</span>
        </span>
        <span className="layer-toggle-text">{label}</span>
      </label>
    </div>
  );
};

export default LayerToggle;
