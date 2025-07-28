import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "@/landing.css";
import logo from "/icon-192_v2.png"; // cambiá por tu logo real
import { Dialog } from "primereact/dialog";
import RequestAccessDialog from "@/components/RequestAccessDialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Accordion, AccordionTab } from "primereact/accordion";

export default function Landing() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const loginUrl = "/login";
  const [activeSection, setActiveSection] = useState("");
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [showBetaBanner, setShowBetaBanner] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBetaBanner(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log(entry.target.id);
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px -49% 0px", // para activar en centro de pantalla
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      name: "Free",
      legend: "Personal use",
      monthly: "0.00",
      yearly: "0.00",
      badge: null,
      features: ["Basic widgets", "Community support"],
    },
    {
      name: "Premium",
      legend: "Power users",
      monthly: "4.99",
      yearly: "3.99",
      badge: "Save 20%",
      features: [
        "All basic widgets + advanced widgets ",
        "Widgets with storage",
        "Priority support",
        "Custom username badge",
      ],
    },
    {
      name: "Enterprise",
      legend: "For teams & organizations",
      monthly: "19.99",
      yearly: "14.99",
      badge: "Save 35%",
      features: [
        "Unlimited groups members",
        "Public dashboards for open communities",
        "Role-based access (admins, editors, viewers)",
        "All widgets: basic, advanced, storage — no limits",
        "Priority support (1st in queue)",
        "Advanced permissions & approval flows",
        "Team usage stats & analytics",
      ],
    },
  ];

  const allWidgets = [
    {
      name: "To-do list",

      color: "#1a232f",
      img: "/imgs/widget_todos.png",
    },
    {
      name: "Calendar",

      color: "#141d29",
      img: "/imgs/widget_calendar.png",
    },
    {
      name: "Notes",

      color: "#394b5e",
      img: "/imgs/widget_notas.png",
    },
    {
      name: "Weather",

      color: "#394b5e71",
      img: "/imgs/widget_weather.png",
    },
    {
      name: "Pomodoro",
      color: "#141d29",
      img: "/imgs/widget_pomodoro.png",
    },
    {
      name: "Weight Tracker",
      color: "#1a232f",
      img: "/imgs/widget_weight.png",
    },
    {
      name: "Chat",
      color: "#394b5e",
      img: "/imgs/widget_chat.png",
    },
    {
      name: "Shared Rent",
      color: "#1a232f",
      img: "/imgs/widget_split.png",
    },
    {
      name: "Fuel Tracker",
      color: "#394b5e71",
      img: "/imgs/widget_fuel.png",
    },
    {
      name: "World Clocks",
      color: "#394b5e",
      img: "/imgs/widget_watches.png",
    },
    {
      name: "Image",
      color: "#1a232f",
      img: "/imgs/widget_imagen.png",
    },
    {
      name: "Countdowns",
      color: "#1a232f",
      img: "/imgs/widget_countdowns.png",
    },
  ];

  return (
    <div className="landing">
      {/* Beta Banner */}
      {showBetaBanner && (
        <div
          className="beta-floating-banner cursor-pointer"
          onClick={() => setShowRequestAccess(true)}
        >
          <strong>Now in Public Beta!</strong>
          <br />
          Use it, break it, tell us everything.❤️
        </div>
      )}
      {/* NAVBAR */}
      <div className="rounded-edge">&nbsp;</div>
      <nav
        id="menu"
        className="navbar navbar-expand-md px-lg-1 px-lg-4 py-1 py-lg-3  "
      >
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img src={logo} width="60px" height="60px" />
            <h2>FocusPit</h2>
          </a>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainMenu"
            aria-controls="mainMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list text-white fs-1"></i>
          </button>

          <div className="collapse navbar-collapse" id="mainMenu">
            <ul className="navbar-nav mx-auto gap-3">
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeSection === "hero" ? "active" : ""
                  }`}
                  href="#"
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeSection === "whatFor" ? "active" : ""
                  }`}
                  href="#whatFor"
                >
                  What is it for?
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeSection === "templates" ? "active" : ""
                  }`}
                  href="#templates"
                >
                  Templates
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeSection === "widgets" ? "active" : ""
                  }`}
                  href="#widgets"
                >
                  Widgets
                </a>
              </li>

              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeSection === "faqs" ? "active" : ""
                  }`}
                  href="#faqs"
                >
                  Faqs
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${
                    activeSection === "pricing" ? "active" : ""
                  }`}
                  href="#pricing"
                >
                  Plans & Pricing
                </a>
              </li>
            </ul>

            <a className="nav-login px-3" href={loginUrl}>
              Login / Register
            </a>
          </div>
        </div>
      </nav>
      {/* HERO */}
      <section
        id="hero"
        className="container pb-5 my-5 text-center text-md-start"
      >
        <div className="align-items-center position-relative">
          <div className="legend">
            <h1>
              <i>"One App to Rule Them All..."</i>
              <br />
              Dashboards for <strong>Everything You Do</strong>
            </h1>
            <h5 className="mt-3 legend">
              Create dashboards for your tasks, your car, your home — even your
              relationship.
              <br />
              Solo or shared: with friends, family, or your rock band.
              <br />
              Smart widgets. Shared focus. Less mess.
            </h5>

            <div className="input-group my-5">
              {/* <a href={loginUrl} className="btn-pistacho fs-4 mx-auto px-5">
                Build My Dashboard
              </a> */}
              <button
                className="btn-beta"
                onClick={() => setShowRequestAccess(true)}
              >
                Try the Beta Now
              </button>
            </div>
          </div>
        </div>
        <div
          className="d-none d-lg-block wrap-slider"
          style={{
            background:
              "transparent url('/imgs/slider/mac_v2.png') no-repeat center top / cover",
          }}
        >
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="hero-swiper"
          >
            {[
              "/imgs/slider/img1.png",
              "/imgs/slider/img2.png",
              "/imgs/slider/img3.png",
              "/imgs/slider/img4.png",
              "/imgs/slider/img5.png",
              "/imgs/slider/img6.png",
            ].map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  className="img-fluid img-prod"
                  alt={`slide ${index + 1}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <img
          className="d-block d-lg-none img-prod"
          src="/screen_mobile.png"
          title="mobile"
        />
      </section>
      <section className="container py-5" id="whatFor">
        <h2 className="text-center display-5 fw-bold text-pistacho mb-3">
          What is it for?
        </h2>
        <p className="text-center text-muted lead mb-5">
          Focuspit helps you bring order to your life, projects and routines —
          in a clear, visual and flexible way.
        </p>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-panel rounded p-4 h-100 shadow-sm hover-up">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-person-circle fs-3 text-pistacho"></i>
                <h4 className="m-0 fw-bold">Personal use</h4>
              </div>
              <ul className="small lh-lg ps-5 m-0">
                <li>&#8729; Plan your day with a custom dashboard</li>
                <li>&#8729; Track tasks, events, shopping and reminders</li>
                <li>&#8729; Build routines like "drink water"</li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-panel rounded p-4 h-100 shadow-sm hover-up">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-people fs-3 text-pistacho"></i>
                <h4 className="m-0 fw-bold">Shared life</h4>
              </div>
              <ul className="small lh-lg ps-5 m-0">
                <li>&#8729; Organize housework with your partner or family</li>
                <li>&#8729; Coordinate who does what and when</li>
                <li>
                  &#8729; Use shared widgets like to-do lists and calendars
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-panel rounded p-4 h-100 shadow-sm hover-up">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-kanban fs-3 text-pistacho"></i>
                <h4 className="m-0 fw-bold">Projects & teams</h4>
              </div>
              <ul className="small lh-lg ps-5">
                <li>&#8729; Manage simple projects without complex tools</li>
                <li>&#8729; Share dashboards with collaborators or clients</li>
                <li>&#8729; Use templates to get started fast</li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-panel rounded p-4 h-100 shadow-sm hover-up">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-sliders fs-3 text-pistacho"></i>
                <h4 className="m-0 fw-bold">Creative Layouts</h4>
              </div>
              <ul className="small lh-lg ps-5">
                <li>&#8729; Add and remove widgets like Lego pieces</li>
                <li>&#8729; Rearrange your layout to match how you think</li>
                <li>&#8729; Create templates for any kind of workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="container py-5">
        <h2 className="text-center mb-4">Why Focuspit?</h2>
        <p className="text-center text-muted mb-5">
          Tired of juggling 5 different apps to stay organized?
          <br />
          Focuspit brings it all together — your life, your people, your way.
        </p>

        <div className="container my-5">
          <div className="row g-3">
            {/* COLUMNA DERECHA */}
            <div className="col-12 col-md-6">
              <div className="p-4 pe-5 bg-panel rounded why-1">
                <h3 className="fw-bold mb-2">Fresh Start, Every Day</h3>
                <p className="small mb-0">
                  Wake up, open Focuspit, and know exactly what matters today.
                  <br />
                  No tabs, no chaos — just clarity.
                </p>
              </div>
            </div>

            {/* COLUMNA IZQUIERDA */}
            <div className="col-12 col-md-6">
              <div className="d-flex flex-column h-100 gap-3">
                {/* Bloque 1 */}
                <div className="p-4 bg-panel text-white rounded h-100">
                  <h3 className="fw-bold mb-2">Personal & Shared Dashboards</h3>
                  <p className="small mb-0 pe-5">
                    Create one for your life, routines, or goals — or share with
                    your team, partner or family. Everyone stays in sync.
                  </p>
                </div>

                {/* Bloque 2 */}
                <div className="p-4 rounded h-100 why-3">
                  <h3 className="fw-bold mb-2">Custom Layouts</h3>
                  <p className="small mb-0 pe-5">
                    Build dashboards that match how you think — drag, drop, and
                    rearrange freely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="container-fluid"
        id="templates"
        style={{ backgroundColor: "#0b0c0e", padding: "100px" }}
      >
        <div className="row g-1 py-5">
          <div className="col-12 col-lg-6 text-center">
            <h2>Templates</h2>
            <p className="text-muted mb-5">
              Start with a <strong>pre-built</strong> configuration and{" "}
              <strong>customize</strong> it your way.
              <br />
              Today here <strong>more than 25 widgets</strong>, and they are
              updated weekly!
            </p>
          </div>
          <Link to={loginUrl} className=" col-12 col-lg-3">
            <div className="template-box">
              <span className="text-muted">Daily Panel</span>
              <img className="rounded-3" src="/m_t_produc_starter.png" />
            </div>
          </Link>

          <Link to={loginUrl} className="col-12 col-lg-3">
            <div className="template-box">
              <span className="text-muted">Projects</span>
              <img className="rounded-3" src="/m_t_smallpro.png" />
            </div>
          </Link>

          <Link to={loginUrl} className="col-12 col-lg-3">
            <div className="template-box">
              <span className="text-muted">Car Care</span>
              <img className="rounded-3" src="/m_t_mycar.png" />
            </div>
          </Link>

          <Link to={loginUrl} className="col-12 col-lg-3">
            <div className="template-box">
              <span className="text-muted">Group of friends</span>
              <img className="rounded-3" src="/m_t_friends.png" />
            </div>
          </Link>

          <Link to={loginUrl} className="col-12 col-lg-3">
            <div className="template-box">
              <span className="text-muted">Rental</span>
              <img className="rounded-3" src="/m_t_rental.png" />
            </div>
          </Link>

          <Link to={loginUrl} className="col-12 col-lg-3">
            <div className="template-box">
              <span className="text-muted">Home</span>
              <img className="rounded-3" src="/m_t_house.png" />
            </div>
          </Link>
        </div>
      </section>
      {/* WIDGET GRID */}
      <section className="container py-5" id="widgets">
        <h2 className="text-center mb-4">Widgets</h2>
        <p className="text-center text-muted mb-5">New widgets every week</p>
        <div className="row g-4">
          {allWidgets.map((w, i) => (
            <div className="col-6 col-md-4" key={i}>
              <Link
                to={loginUrl}
                className="category-box p-4 rounded text-white text-center fw-bold"
                style={{ backgroundColor: w.color }}
              >
                {w.name}
                <img width="200px" src={w.img} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS */}
      <section className="container py-5" id="faqs">
        <h2 className="text-center mb-4">FAQs</h2>
        <p className="text-center text-muted mb-5">
          Here are some common questions about Focuspit.
          <br />
          If you have more, feel free to contact us by email.
        </p>

        <Accordion multiple className="faq-accordion">
          <AccordionTab header="What is Focuspit?">
            Focuspit is a customizable productivity dashboard where you organize
            different parts of your life using smart widgets. Create dashboards
            for personal use, work, relationships, or hobbies.
          </AccordionTab>

          <AccordionTab header="Is it free to use?">
            Yes! You can start with the free plan which includes core widgets.
            We also offer premium features and team-based plans if you need
            more.
          </AccordionTab>

          <AccordionTab header="Can I share a dashboard with others?">
            Absolutely. You can invite friends, family or teammates to
            collaborate in the same group and share widgets in real time.
          </AccordionTab>

          <AccordionTab header="What kind of widgets are available?">
            From to-do lists and calendars to chat, weather, routines, shared
            rent, countdowns and more. We’re adding new widgets every week.
          </AccordionTab>

          <AccordionTab header="Do I need to install anything?">
            Focuspit runs entirely in your browser. It also works as a
            Progressive Web App (PWA), so you can install it on desktop or
            mobile if you prefer.
          </AccordionTab>

          <AccordionTab header="Is there a desktop version of Focuspit?">
            Yes! In addition to the web app and PWA, you can download Focuspit
            as a native desktop app for Windows & Mac.
            <br />
            It works offline and updates automatically. Great for full-screen or{" "}
            <strong>second screen</strong> productivity!
            <p className="small mt-2">
              👉 Download for Windows{" "}
              <a href="/downloads/FocusPit-Installer-1.0.0.exe">here</a>.
            </p>
            <p className="small mt-2">
              👉 Download for Mac{" "}
              <a href="/downloads/FocusPit-Installer-1.0.0.exe">here</a>.
            </p>
          </AccordionTab>

          <AccordionTab header="How is my data stored and secured?">
            All your data is securely stored in Google Firebase with real-time
            updates. We don’t sell your data or show ads.
          </AccordionTab>

          <AccordionTab header="Can I create multiple dashboards?">
            Yes! You can create as many groups/dashboards as you need — for
            personal goals, projects, habits, family, etc.
          </AccordionTab>
        </Accordion>
      </section>

      <section
        className="container-fluid py-5 bg-dark d-none d-lg-block"
        id="desktop-app"
      >
        <div className="container py-5 ">
          <div className="row align-items-center">
            {/* TEXTO + BOTONES */}
            <div className="col-md-6 text-white">
              <h2 className="fw-bold mb-3">We also have a desktop app!</h2>
              <p className="text-muted mb-4">
                Use Focuspit as a native app on Windows or macOS — no browser
                needed. It runs offline and launches faster than ever.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-3">
                <a href="https://drive.google.com/file/d/12vaxRCo7w08ZLHLUcO-nR03lkQU08aWM/view?usp=sharing">
                  <img src="/imgs/dwn-for-windows.png" />
                </a>
                <a href="https://drive.google.com/file/d/1T953JLnlmUmg5zscjPduwjnYxYK1L9Qj/view?usp=sharing">
                  <img src="/imgs/dwn-for-mac.png" />
                </a>
              </div>

              <div
                className="alert alert-info small mt-5"
                style={{ maxWidth: "500px" }}
              >
                <strong>Note:</strong> Focuspit is not yet verified by Microsoft
                or Apple, so your system might show a warning during
                installation.
                <br />
                You can safely bypass it by choosing "Run anyway" or "Open
                anyway".
                <br />
                We are currently optimizing the desktop apps for better
                performance and experience.
              </div>
            </div>

            {/* IMÁGENES */}
            <div className="col-md-6 text-center">
              <img
                className="img-prod"
                src="/screen_desktop.png"
                title="desktop"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5" id="pricing">
        <h2 className="text-center mb-4">Plans & Pricing</h2>
        <p className="text-center text-muted mb-5">
          Start for free and upgrade anytime.
        </p>

        {/* TOGGLE MONTHLY / YEARLY */}
        <div className="text-center mb-5">
          <div
            className="d-inline-flex align-items-center bg-panel rounded-pill p-1"
            style={{ border: "1px solid var(--line-color)" }}
          >
            <button
              className={`rounded-pill px-3 ${
                !isYearly ? "btn-pistacho" : "btn-dark text-white"
              }`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`rounded-pill px-3  ${
                isYearly ? "btn-pistacho" : "btn-dark text-white"
              }`}
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* PLANES */}
        <div className="row g-4 pb-5 justify-content-center plans">
          {plans.map((plan, index) => (
            <div className="col-12 col-lg-4" key={index}>
              <div className="p-4 rounded bg-panel text-white h-100 text-center shadow-sm position-relative">
                {isYearly && plan.badge && (
                  <span className="badge bg-success position-absolute top-0 end-0 m-2">
                    {plan.badge}
                  </span>
                )}
                <h4 className="text-pistacho">{plan.name}</h4>
                <label className="text-muted mb-4">{plan.legend}</label>
                <div className="display-5 fw-bold">
                  ${isYearly ? plan.yearly : plan.monthly}
                  <span className="fs-6">/mo</span>
                </div>
                <hr className="my-3 border-light" />
                <ul className="list-unstyled lh-lg small">
                  {plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>

                {index === 0 ? (
                  <button
                    className="btn-beta btn-beta-small mb-3 "
                    onClick={() => setShowRequestAccess(true)}
                  >
                    Try the Beta Now
                  </button>
                ) : (
                  <button
                    className="btn btn-pistacho-outline border-white mt-3 "
                    // onClick={() => setShowRequestAccess(true)}
                    disabled
                  >
                    not yet...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="container py-5 text-center" id="download">
        <h2 className="mb-4">🎯 Download FocusPit for Windows</h2>
        <p className="lead">
          Get started with your personal productivity dashboard — no signup
          needed.
        </p>

        <a
          href="/downloads/FocusPit-Installer-1.0.0.exe"
          className="btn btn-success btn-lg my-4 px-5 py-2 fs-5"
        >
          ⬇️ Download Installer (.exe)
        </a>

        <p className="mt-2 text-muted">
          Or try the portable version:{" "}
          <a href="/downloads/FocusPit.zip">Download .ZIP</a>
        </p>

        <div
          className="alert alert-warning text-start mx-auto mt-5"
          style={{ maxWidth: "600px" }}
        >
          <h5 className="mb-3">🛡️ Note about installation</h5>
          <p>
            This installer is not yet digitally signed. Windows may show a
            warning like:
            <strong> “Windows protected your PC”</strong>.
          </p>
          <p className="mb-2">
            <strong>To continue:</strong>
          </p>
          <ol>
            <li>
              Click on <strong>“More info”</strong>
            </li>
            <li>
              Then click <strong>“Run anyway”</strong>
            </li>
          </ol>
          <img
            src="https://learn.microsoft.com/en-us/windows/security/threat-protection/smartscreen/images/smartscreen_app_blocked.png"
            alt="SmartScreen Warning"
            className="img-fluid mt-2"
          />
          <p className="mt-3 small">
            🔍 You can verify the file with{" "}
            <a
              href="https://www.virustotal.com/"
              target="_blank"
              rel="noreferrer"
            >
              VirusTotal
            </a>
            .
          </p>
        </div>

        <p className="text-muted mt-4">
          Need help? Contact us at{" "}
          <a href="mailto:martin@focuspit.com">info@focuspit.com</a>
        </p>
      </section> */}

      <section className="prefooter py-5 bg-dark text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0 text-center">
              <img
                src="/imgs/imgprev.png"
                alt="Focuspit widgets preview"
                className="img-fluid"
                style={{ maxHeight: "500px" }}
              />
            </div>
            <div className="col-md-6 text-center">
              <h2 className="fw-bold mb-3">
                Start today and take control of your day.
              </h2>
              <p className="lead mb-4">
                Focuspit helps you organize your life with smart & simple
                widgets — so you can stay focused and get things done.
              </p>
              {/* <button href={loginUrl} className="btn-pistacho fs-4 px-5">
                Build My Dashboard
              </button> */}
              <button
                className="btn-beta"
                onClick={() => setShowRequestAccess(true)}
              >
                Try the Beta Now
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <>
        <footer className="py-4 text-center text-muted">
          <div className="container small">
            <div className="d-flex justify-content-center gap-3 mb-2">
              <a
                href="https://www.instagram.com/focuspit.ok"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted"
              >
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a
                href="https://www.reddit.com/r/FocusPit/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted"
              >
                <i className="bi bi-reddit fs-5"></i>
              </a>
            </div>

            <div>
              <button
                className="btn btn-link text-muted small p-0"
                onClick={() => setShowPrivacy(true)}
              >
                Privacy Policy
              </button>
              <span className="px-3">|</span>
              <button
                className="btn btn-link text-muted small p-0"
                onClick={() => setShowTerms(true)}
              >
                Terms of Use
              </button>
              <span className="px-3">|</span>
              <a
                href="mailto:contact@focuspit.com"
                className="btn btn-link text-muted small p-0"
              >
                Contact Us
              </a>
            </div>

            <div className="text-muted small mt-2">
              © {new Date().getFullYear()} Focuspit. All rights reserved.
            </div>
          </div>
        </footer>

        {/* Privacy Policy */}
        <Dialog
          header="Privacy Policy"
          visible={showPrivacy}
          onHide={() => setShowPrivacy(false)}
          style={{ width: "90vw", maxWidth: "600px" }}
          breakpoints={{ "960px": "95vw", "640px": "100vw" }}
          className="bg-dark text-white"
          draggable={false}
          closable
        >
          <div className="small">
            Privacy Policy Last updated: July 15, 2025 This Privacy Policy
            describes how Focuspit (“we”, “us”, or “our”) collects, uses, and
            shares information about you when you use our website, mobile
            applications, and related services (collectively, the “Service”). By
            using the Service, you consent to the collection and use of your
            personal information as described in this Privacy Policy. If you do
            not agree with any part of this policy, you must not use our
            Service.
            <br />
            <br />
            1. Information We Collect 1.1 Personal Information We may collect
            personal information you voluntarily provide, including but not
            limited to: Name Email address Profile photo or avatar Login
            credentials (via email or third-party providers like Google)
            Usernames or identifiers 1.2 Automatically Collected Information
            When you use the Service, we may automatically collect: IP address
            Browser type and version Device type and OS Date and time of access
            Pages visited and usage patterns Referring URLs 1.3 Cookies and
            Tracking Technologies We use cookies, localStorage, and similar
            technologies to: Authenticate users Maintain session state Analyze
            traffic Improve performance You may disable cookies in your browser
            settings; however, doing so may limit certain functionalities.
            <br />
            <br />
            2. Use of Information We use collected information to: Provide,
            maintain, and improve the Service Authenticate users and manage
            sessions Personalize your experience Communicate with you (e.g.,
            service updates) Prevent fraud and ensure security Comply with legal
            obligations
            <br />
            <br />
            3. Legal Basis for Processing (GDPR) If you are in the European
            Economic Area (EEA), we process your information under the following
            lawful bases: Your consent Performance of a contract Legal
            obligations Legitimate interests (e.g., product improvement, fraud
            prevention) <br />
            <br />
            4. Data Sharing and Disclosure We do not sell your personal data. We
            may share information with: 4.1 Service Providers Third parties who
            provide services on our behalf, such as: Hosting (e.g., Firebase by
            Google) Analytics (e.g., Google Analytics) Authentication (e.g.,
            Firebase Auth) These providers are contractually bound to protect
            your data and may only use it as instructed by us. 4.2 Legal
            Requirements We may disclose information if required by law or in
            response to valid legal requests, such as subpoenas, court orders,
            or to comply with applicable laws. 4.3 Business Transfers If
            Focuspit is involved in a merger, acquisition, or asset sale, your
            information may be transferred as part of that transaction. <br />
            <br />
            5. Data Retention We retain your information for as long as
            necessary to: Provide the Service Comply with legal obligations
            Resolve disputes Enforce agreements Inactive accounts may be deleted
            after prolonged inactivity, subject to our discretion. <br />
            <br />
            6. Data Security We implement appropriate technical and
            organizational measures to protect your data, including: Secure
            HTTPS connections Encrypted data storage (when applicable) Access
            controls and authentication However, no system is 100% secure. Use
            of the Service is at your own risk. <br />
            <br />
            7. International Transfers We operate globally. By using our
            Service, you acknowledge that your information may be transferred to
            and processed in countries outside of your jurisdiction, including
            the United States, where data protection laws may differ. <br />
            <br />
            8. Your Rights Depending on your location, you may have the right
            to: Access the personal information we hold about you Correct or
            update your personal data Request deletion of your data Object to or
            restrict processing Withdraw consent at any time To exercise these
            rights, contact: privacy@focuspit.com <br />
            <br />
            9. Children's Privacy The Service is not intended for children under
            the age of 13 (or equivalent minimum age in your jurisdiction). We
            do not knowingly collect personal data from children. If we discover
            such data has been collected, we will delete it promptly. <br />
            <br />
            10. California Residents (CCPA) If you are a California resident,
            you have the right to: Know what personal data we collect and how we
            use it Request deletion of your data Opt out of the sale of personal
            data (we do not sell data) Requests can be made via
            privacy@focuspit.com. <br />
            <br />
            11. Changes to This Policy We reserve the right to update this
            Privacy Policy at any time. Changes will be effective upon posting
            on this page. We encourage users to review this policy periodically.{" "}
            <br />
            <br />
            12. Contact Us If you have any questions or concerns about this
            Privacy Policy or our practices, please contact us at: Focuspit
            Email: privacy@focuspit.com
          </div>
        </Dialog>

        {/* Terms of Use */}
        <Dialog
          header="Terms of Use"
          visible={showTerms}
          onHide={() => setShowTerms(false)}
          style={{ width: "90vw", maxWidth: "700px" }}
          breakpoints={{ "960px": "95vw", "640px": "100vw" }}
          className="bg-dark text-white"
          draggable={false}
          closable
        >
          <div
            className="small"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            <p>
              These Terms of Use (“Terms”) constitute a legally binding
              agreement between you (“User”, “you”, or “your”) and Focuspit
              (“we”, “us”, “our”, or “the Company”) governing your access to and
              use of the Focuspit application, website, software, and related
              services (collectively, the “Service”).
            </p>

            <h6>1. Acceptance of Terms</h6>
            <p>
              By accessing, registering for, or using the Service in any
              capacity, you expressly agree to be bound by these Terms. If you
              do not agree to all the provisions herein, you must immediately
              discontinue use of the Service.
            </p>

            <h6>2. Modification of Terms</h6>
            <p>
              We reserve the unilateral right, at our sole discretion, to
              modify, amend, revise, or otherwise update these Terms at any
              time, with or without prior notice. Continued use of the Service
              after such changes shall constitute your consent to the updated
              Terms.
            </p>

            <h6>3. Eligibility</h6>
            <p>
              You represent and warrant that you are at least thirteen (13)
              years of age or the age of legal majority in your jurisdiction.
              Use of the Service by individuals under such age without
              verifiable parental or legal guardian consent is strictly
              prohibited.
            </p>

            <h6>4. Use of the Service</h6>
            <p>
              You agree to use the Service solely for lawful purposes and in
              accordance with these Terms. You shall not, under any
              circumstances:
              <ul>
                <li>
                  Attempt to gain unauthorized access to the Service, accounts,
                  or systems
                </li>
                <li>
                  Use the Service to distribute malware, spam, or abusive
                  content
                </li>
                <li>Engage in reverse-engineering, scraping, or data mining</li>
                <li>Violate any applicable law or third-party rights</li>
                <li>Impersonate any individual or entity</li>
              </ul>
            </p>

            <h6>5. Intellectual Property</h6>
            <p>
              All content, design elements, graphics, code, text, trademarks,
              and other materials provided via the Service are the exclusive
              property of Focuspit or its licensors. You are granted a limited,
              non-exclusive, non-transferable, revocable license to access and
              use the Service for personal, non-commercial purposes. Any
              reproduction, modification, distribution, or commercial
              exploitation is strictly prohibited without prior written consent.
            </p>

            <h6>6. Termination and Suspension</h6>
            <p>
              We reserve the right, without limitation, to suspend, terminate,
              or restrict your access to the Service at our sole discretion,
              without notice or liability, for conduct we believe violates these
              Terms, applicable law, or is otherwise harmful to other users or
              the Company.
            </p>

            <h6>7. Disclaimers</h6>
            <p>
              THE SERVICE IS PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. WE
              DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT
              LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR
              SECURE.
            </p>

            <h6>8. Limitation of Liability</h6>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL
              FOCUSPIT, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
              OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              EXEMPLARY, OR CONSEQUENTIAL DAMAGES WHATSOEVER, INCLUDING BUT NOT
              LIMITED TO LOSS OF DATA, PROFITS, USE, OR GOODWILL, ARISING OUT OF
              OR IN CONNECTION WITH THE USE OF OR INABILITY TO USE THE SERVICE.
            </p>

            <h6>9. Indemnification</h6>
            <p>
              You agree to indemnify, defend, and hold harmless Focuspit and its
              affiliates from and against any and all claims, liabilities,
              damages, losses, and expenses (including reasonable attorneys'
              fees) arising out of or in any way connected with your access to
              or use of the Service, your violation of these Terms, or your
              infringement of any intellectual property or other right of any
              person or entity.
            </p>

            <h6>10. Governing Law and Jurisdiction</h6>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Focuspit is legally
              registered. Any legal action or proceeding arising out of or
              relating to these Terms shall be brought exclusively in the
              competent courts of said jurisdiction.
            </p>

            <h6>11. Severability</h6>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or
              unenforceable under applicable law, such provision shall be deemed
              severed and the remaining provisions shall remain in full force
              and effect.
            </p>

            <h6>12. Contact Information</h6>
            <p>
              For any questions or concerns regarding these Terms, please
              contact us at:
              <br />
              <strong>Email:</strong> support@focuspit.com
            </p>
          </div>
        </Dialog>

        {/* RequestAccessDialog */}
        <RequestAccessDialog
          visible={showRequestAccess}
          onHide={() => setShowRequestAccess(false)}
        />
      </>
    </div>
  );
}
