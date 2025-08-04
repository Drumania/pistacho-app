import { Button } from "primereact/button";

export default function CommunityGroupStep({ onBack }) {
  return (
    <div className="text-left p-5">
      <img src="/imgs/nw-dash/nt_img4.png" width="60px" alt="Community icon" />
      <h3 className="mb-3">Community Templates</h3>
      <p className="text-muted">
        Very soon you'll be able to explore templates and 21-day challenges
        created by other Focuspit users.
      </p>
      <p className="text-muted">
        Discover unique dashboards, creative layouts, and new ways to stay
        focused, all shared by the community.
      </p>
      <p className="text-muted">Stay tuned!</p>

      <Button
        label="⬅ Back"
        className="btn-pistacho-outline cw-100"
        onClick={onBack}
      />
    </div>
  );
}
