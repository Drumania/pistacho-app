// src/components/groups/NewGroupSteps/ChallengeGroupStep.jsx
import { Button } from "primereact/button";

export default function ChallengeGroupStep({ onBack }) {
  return (
    <div className="text-left p-5">
      <img src="/imgs/nw-dash/nt_img3.png" width="60px" />
      <h3 className="my-3">21-day Challenge</h3>
      <p className="text-muted">
        We're working on a new system of 21-day habit challenges to help you
        stay consistent and motivated
        <br />
        Each challenge is designed to build momentum through daily actions.
      </p>
      <p className="text-muted">
        Complete a challenge and you'll earn a unique badge to show off on your
        profile. ✨
      </p>
      <p className="text-muted">Coming soon – stay tuned! 💪</p>

      <Button
        label="⬅ Back"
        className="btn-pistacho-outline cw-100"
        onClick={onBack}
      />
    </div>
  );
}
