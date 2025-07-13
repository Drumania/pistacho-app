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
      <section
        id="hero"
        className="container pb-5 my-5 text-center text-md-start"
      >
        <div className="row widget-content align-items-center position-relative">
          <div className="col-12 col-md-6 legend">
            <h1 className="display-6">
              Your <strong>Custom dashboards</strong> personal and shared
            </h1>
            <h5 className="mt-3">
              Organize your tasks, events, notes and more — all in one place.{" "}
              <br />
              Use smart widgets to manage your day, your projects and your life.
            </h5>
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
        </div>
        <img
          className="d-none d-lg-block img-prod"
          src="/screen_desktop.png"
          title="desktop"
        />
        <img
          className="d-block d-lg-none img-prod"
          src="/screen_mobile.png"
          title="desktop"
        />
      </section>

      {/* WHAT FOR */}
      <div className="mt-5 py-5" style={{ backgroundColor: "#141d29" }}>
        <section className="container py-5" id="what-for">
          <h2 className="text-center mb-4">What is it for?</h2>
          <p className="text-center text-muted mb-5">
            Focuspit helps you organize everything in your life, your projects
            and your routines — visually and in one place.
          </p>

          <div className="row g-4">
            {/* Personal use */}
            <div className="col-12 col-md-6">
              <div className="rounded p-4 widget-content position-relative">
                <h3 className="fw-bold mb-3">Personal use</h3>
                <ul className="small lh-lg ps-3">
                  <li>Plan your day with a custom dashboard</li>
                  <li>Track tasks, events, shopping and reminders</li>
                  <li>Build routines like "drink water"</li>
                </ul>
                {/* Agregá tu imagen como <img> o con background-image aquí si querés */}
              </div>
            </div>

            {/* Shared life */}
            <div className="col-12 col-md-6">
              <div className="rounded p-4 widget-content position-relative">
                <h3 className="fw-bold mb-3">Shared life</h3>
                <ul className="small lh-lg ps-3">
                  <li>Organize housework with your partner or family</li>
                  <li>Coordinate who does what and when</li>
                  <li>Use shared widgets like to-do lists and calendars</li>
                </ul>
              </div>
            </div>

            {/* Projects & teams */}
            <div className="col-12 col-md-6">
              <div className="rounded p-4 widget-content position-relative">
                <h3 className="fw-bold mb-3">Projects & teams</h3>
                <ul className="small lh-lg ps-3">
                  <li>Manage simple projects without complex tools</li>
                  <li>Share dashboards with collaborators or clients</li>
                  <li>Use templates to get started fast</li>
                </ul>
              </div>
            </div>

            {/* Creative freedom */}
            <div className="col-12 col-md-6">
              <div className="rounded p-4 widget-content position-relative">
                <h3 className="fw-bold mb-3">Creative freedom</h3>
                <ul className="small lh-lg ps-3">
                  <li>Add and remove widgets like Lego pieces</li>
                  <li>Rearrange your layout to match how you think</li>
                  <li>Create templates for any kind of workflow</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="container py-5" id="templates">
        <h2 className="text-center mb-4">Templates</h2>
        <p className="text-center text-muted mb-5">
          Start with a pre-built setup and customize it your way.
        </p>

        <div className="template-grid">
          <div className="template-box tall">
            <span>Daily Panel</span>
          </div>
          <div className="template-box wide">
            <span>Home Tasks</span>
          </div>
          <div className="template-box">
            <span>Car Care</span>
          </div>
          <div className="template-box">
            <span>Work Project</span>
          </div>
          <div className="template-box wide">
            <span>Finance</span>
          </div>
          <div className="template-box">
            <span>Tracker</span>
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
