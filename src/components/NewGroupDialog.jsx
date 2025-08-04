// src/components/groups/NewGroupDialog.jsx
import { useState } from "react";
import { Dialog } from "primereact/dialog";
import EmptyGroupStep from "./NewGroupSteps/EmptyGroupStep";
import TemplateGroupStep from "./NewGroupSteps/TemplateGroupStep";
import ChallengeGroupStep from "./NewGroupSteps/ChallengeGroupStep";
import CommunityGroupStep from "./NewGroupSteps/CommunityGroupStep";

const TABS = [
  {
    label: "Create empty dashboard",
    key: "empty",
    tip: "Start with a blank dashboard, no widgets added.",
    img: "/imgs/nw-dash/nt_img1.png",
    soon: false,
  },
  {
    label: "Use a dashboard template",
    key: "template",
    tip: "Start with a pre-designed layout and widgets.",
    img: "/imgs/nw-dash/nt_img2.png",
    soon: false,
  },
  {
    label: "21-day challenge",
    key: "challenge",
    tip: "Track a daily habit for 21 days.",
    img: "/imgs/nw-dash/nt_img3.png",
    soon: true,
  },
  {
    label: "Community templates",
    key: "community",
    tip: "Browse templates and challenges from other users.",
    img: "/imgs/nw-dash/nt_img4.png",
    soon: true,
  },
];

export default function NewGroupDialog({ visible, onHide, user, onCreate }) {
  const [step, setStep] = useState(null);

  const resetDialog = () => {
    setStep(null); // volver a paso inicial
  };

  const closeDialog = () => {
    setStep(null);
    onHide(); // cerrar modal
  };

  return (
    <Dialog
      visible={visible}
      onHide={closeDialog}
      header="Create New Dashboard"
      style={{ width: "70vw", maxWidth: "1000px", height: "70vh" }}
      className="new-group-dialog"
      modal
    >
      {/* Header custom */}
      {/* <div className="text-center mb-4">
        <p className="text-muted small">
          Organize your life with templates, challenges or start from scratch.
        </p>
      </div> */}

      {/* Botones grandes de selección */}
      {step === null && (
        <div className="row px-2 pb-3 g-3">
          {TABS.map((tab) => {
            const isSoon = tab.soon;

            return (
              <div className="col-6" key={tab.key}>
                <div className="position-relative">
                  {isSoon && (
                    <span
                      className="badge bg-secondary position-absolute"
                      style={{ top: "10px", right: "10px", fontSize: "0.7rem" }}
                    >
                      Coming soon
                    </span>
                  )}

                  <button
                    className={`btn-nw-dashboard w-100 text-start p-5 ${
                      isSoon ? "disabled opacity-50" : ""
                    }`}
                    onClick={() => {
                      if (!isSoon) setStep(tab.key);
                    }}
                    disabled={isSoon}
                    style={{ cursor: isSoon ? "not-allowed" : "pointer" }}
                  >
                    <img src={tab.img} alt={tab.label} width="60px" />

                    <strong className="d-block fs-4 mt-4 mb-1">
                      {tab.label}
                    </strong>
                    <span className="small text-muted d-block">{tab.tip}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      {step === "empty" && (
        <EmptyGroupStep
          user={user}
          onCreate={(group) => {
            onCreate?.(group);
            closeDialog();
          }}
          onBack={resetDialog}
        />
      )}

      {step === "template" && (
        <TemplateGroupStep
          user={user}
          onCreate={(group) => {
            onCreate?.(group);
            closeDialog();
          }}
          onBack={resetDialog}
        />
      )}

      {step === "challenge" && <ChallengeGroupStep onBack={resetDialog} />}

      {step === "community" && <CommunityGroupStep onBack={resetDialog} />}
    </Dialog>
  );
}
