export default function ToDoWidget() {
  return (
    <div>
      <h5 className="mb-3">To-Do List</h5>
      <ul className="list-unstyled small">
        <li>
          <input type="checkbox" defaultChecked /> Comprar pan
        </li>
        <li>
          <input type="checkbox" /> Terminar mockups
        </li>
        <li>
          <input type="checkbox" /> Llamar al cliente
        </li>
      </ul>
    </div>
  );
}
