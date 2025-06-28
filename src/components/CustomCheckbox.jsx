export default function CustomCheckbox({ checked, onChange, customId }) {
  return (
    <label className="custom-checkbox">
      <input
        type="checkbox"
        id={customId}
        checked={checked}
        onChange={onChange}
      />
      <span className="checkmark" />
    </label>
  );
}
