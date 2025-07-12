import { useState } from "react";
import "@/landing.css";
import logo from "/icon-192.png"; // cambiá por tu logo real

export default function Landing() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const widgetCategories = [
    "All",
    "Tasks",
    "Time",
    "Notes",
    "Finance",
    "Weather",
    "Shopping",
  ];

  const allWidgets = [
    { name: "To-do list", category: "Tasks", color: "#90b083" },
    { name: "Calendar", category: "Time", color: "#748d6a" },
    { name: "Notes", category: "Notes", color: "#5d6e7e" },
    { name: "Expenses", category: "Finance", color: "#c97c63" },
    { name: "Weather", category: "Weather", color: "#69b1d9" },
    { name: "Shopping list", category: "Shopping", color: "#d96060" },
    { name: "Pomodoro", category: "Time", color: "#e8aa42" },
  ];

  const filteredWidgets =
    selectedCategory === "All"
      ? allWidgets
      : allWidgets.filter((w) => w.category === selectedCategory);

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav id="menu" className="navbar navbar-expand-md px-4 py-3 ">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img src={logo} width="60px" height="60px" />
            <h2>FocusPit</h2>
          </a>
          <ul className="navbar-nav ms-auto gap-3">
            <li className="nav-item">
              <a className="nav-link " href="#">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link " href="#what-for">
                What is it for?
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link " href="#templates">
                Templates
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link " href="#widgets">
                Widgets
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-login" href="/login">
                Login / Register
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="container pb-5 text-center text-md-start">
        <div className="row widget-content align-items-center">
          <div className="col-md-6">
            <h1 className="display-6 fw-bold">
              The latest electronics: <br />
              discover innovation at your fingertips
            </h1>
            <div className="input-group mt-4">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="What are you looking for?"
              />
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>
          <div className="col-md-6 text-center mt-4 mt-md-0">
            <div className="hero-placeholder bg-light rounded p-5">
              [Hero Image]
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5" id="what-for">
        <h2 className="text-center mb-4">What is it for?</h2>
        <p className="lead text-center mb-5">
          Focuspit helps you organize everything in your life, your projects and
          your routines — visually and in one place.
        </p>

        <div className="row gy-4">
          <div className="col-md-6">
            <h5>🔹 Personal use</h5>
            <ul className="list-unstyled ps-3">
              <li>✔️ Plan your day with a custom dashboard</li>
              <li>✔️ Keep track of tasks, events, shopping and reminders</li>
              <li>
                ✔️ Build routines like "drink water", "take vitamins", or "go
                for a run"
              </li>
            </ul>
          </div>

          <div className="col-md-6">
            <h5>🔹 Shared life</h5>
            <ul className="list-unstyled ps-3">
              <li>
                ✔️ Organize housework and errands with your partner or family
              </li>
              <li>✔️ Coordinate who does what and when</li>
              <li>
                ✔️ Stay in sync with shared widgets like to-do lists, calendar,
                groceries, and expenses
              </li>
            </ul>
          </div>

          <div className="col-md-6">
            <h5>🔹 Projects & teams</h5>
            <ul className="list-unstyled ps-3">
              <li>✔️ Manage simple projects without complex tools</li>
              <li>✔️ Share dashboards with collaborators or clients</li>
              <li>✔️ Use templates to set up everything in minutes</li>
            </ul>
          </div>

          <div className="col-md-6">
            <h5>🔹 Creative freedom</h5>
            <ul className="list-unstyled ps-3">
              <li>✔️ Add and remove widgets like Lego pieces</li>
              <li>
                ✔️ Rearrange your layout to match how <em>you</em> think
              </li>
              <li>
                ✔️ Combine widgets into templates for any kind of workflow
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container py-5" id="templates">
        <h2 className="text-center mb-4">Templates</h2>
        <p className="text-center text-muted mb-5">
          Start with a pre-built setup and customize it your way.
        </p>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div
              className="template-box rounded text-white p-3 position-relative"
              style={{ backgroundColor: "#f7d469" }}
            >
              <img
                src="https://via.placeholder.com/150x100"
                alt="Daily Panel"
                className="img-fluid position-absolute top-50 start-50 translate-middle"
                style={{ maxHeight: "80px" }}
              />
              <div className="position-absolute bottom-0 start-0 p-3 fw-bold">
                Daily panel
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div
              className="template-box rounded text-white p-3 position-relative"
              style={{ backgroundColor: "#ea805c" }}
            >
              <img
                src="https://via.placeholder.com/150x100"
                alt="House Organizer"
                className="img-fluid position-absolute top-50 start-50 translate-middle"
                style={{ maxHeight: "80px" }}
              />
              <div className="position-absolute bottom-0 start-0 p-3 fw-bold">
                Home tasks
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div
              className="template-box rounded text-white p-3 position-relative"
              style={{ backgroundColor: "#93c4e4" }}
            >
              <img
                src="https://via.placeholder.com/150x100"
                alt="Car maintenance"
                className="img-fluid position-absolute top-50 start-50 translate-middle"
                style={{ maxHeight: "80px" }}
              />
              <div className="position-absolute bottom-0 start-0 p-3 fw-bold">
                Car care
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div
              className="template-box rounded text-white p-3 position-relative"
              style={{ backgroundColor: "#d96060" }}
            >
              <img
                src="https://via.placeholder.com/150x100"
                alt="Finance"
                className="img-fluid position-absolute top-50 start-50 translate-middle"
                style={{ maxHeight: "80px" }}
              />
              <div className="position-absolute bottom-0 start-0 p-3 fw-bold">
                Finances
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WIDGETS FILTER */}
      <section className="container py-4" id="widgets">
        <h5 className="mb-3">Browse widgets by category</h5>
        <div className="d-flex flex-wrap gap-2">
          {widgetCategories.map((cat, i) => (
            <button
              key={i}
              className={`btn btn-sm px-3 py-1 rounded-pill ${
                selectedCategory === cat ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* WIDGET GRID */}
      <section className="container pb-5">
        <div className="row g-4">
          {filteredWidgets.map((w, i) => (
            <div className="col-6 col-md-4" key={i}>
              <div
                className="category-box p-4 rounded text-white text-center fw-bold"
                style={{ backgroundColor: w.color }}
              >
                {w.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="widget-content py-5">
        <div className="container text-center">
          <h4>Join the newsletter</h4>
          <p className="text-muted">
            Stay in the loop with our newsletter for exclusive deals, tech
            trends, and updates.
          </p>
          <div className="d-flex justify-content-center mt-3">
            <input
              type="email"
              className="form-control w-50"
              placeholder="E-Mail"
            />
            <button className="btn btn-primary ms-2">Sign me up</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-4 bg-dark text-center text-muted">
        <div className="container small">
          <div className="d-flex justify-content-center gap-3 mb-2">
            <i className="bi bi-twitter"></i>
            <i className="bi bi-facebook"></i>
            <i className="bi bi-instagram"></i>
            <i className="bi bi-pinterest"></i>
            <i className="bi bi-tiktok"></i>
          </div>
          <div>
            <span className="me-3">privacy policy</span>
            <span>shipping & returns</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
