import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import { Badge } from "primereact/badge";

export default function Groups() {
  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const offset = dir === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setShowArrows(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <section className="container-fluid my-1">
      <div className="nav-scroll-wrapper">
        {showArrows && (
          <button className="scroll-arrow left" onClick={() => scroll("left")}>
            <i className="pi pi-angle-left" />
          </button>
        )}

        <div className="nav-groups-container" ref={scrollRef}>
          <div className="wrap-btn">
            <button className="btn-pistacho-outline">+ New Group</button>
          </div>

          <NavLink
            to="/g/me"
            className={({ isActive }) =>
              `nav-groups ${isActive ? "active" : ""}`
            }
          >
            <AvatarGroup>
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                size="small"
                shape="circle"
              />
            </AvatarGroup>
            <span className="ng-name">Me</span>
          </NavLink>

          <NavLink
            to="/g/martin_y_bel"
            className={({ isActive }) =>
              `nav-groups ${isActive ? "active " : ""}`
            }
          >
            <AvatarGroup>
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png"
                size="small"
                shape="circle"
              />
            </AvatarGroup>

            <span className="ng-name">
              Martin y Bel <Badge value="4" severity="danger" />
            </span>
          </NavLink>

          <NavLink
            to="/g/red_cash"
            className={({ isActive }) =>
              `nav-groups ${isActive ? "active" : ""}`
            }
          >
            <AvatarGroup>
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/ionibowcher.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/xuxuefeng.png"
                size="small"
                shape="circle"
              />
              {/* <Avatar label="+2" shape="circle" size="small" /> */}
            </AvatarGroup>
            <span className="ng-name">Red Ca$h</span>
          </NavLink>

          <NavLink
            to="/g/padel"
            className={({ isActive }) =>
              `nav-groups ${isActive ? "active" : ""}`
            }
          >
            <AvatarGroup>
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/ionibowcher.png"
                size="small"
                shape="circle"
              />
              <Avatar
                image="https://primefaces.org/cdn/primereact/images/avatar/xuxuefeng.png"
                size="small"
                shape="circle"
              />
              <Avatar label="+2" shape="circle" size="small" />
            </AvatarGroup>
            <span className="ng-name">Padel Jueves</span>
          </NavLink>
        </div>

        {showArrows && (
          <button
            className="scroll-arrow right"
            onClick={() => scroll("right")}
          >
            <i className="pi pi-angle-right" />
          </button>
        )}
      </div>
    </section>
  );
}
