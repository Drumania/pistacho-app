import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { doc, updateDoc } from "firebase/firestore";
import db from "@/firebase/firestore";

export default function IframeWidgetModal({
  visible,
  onHide,
  groupId,
  widgetId,
  currentUrl,
  currentTitle,
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const ref = doc(
    db,
    "widget_data",
    "iframewidget",
    `${groupId}_${widgetId}`,
    "config"
  );

  useEffect(() => {
    if (visible) {
      setTitle(currentTitle || "");
      setUrl(currentUrl || "");
      setError("");
    }
  }, [visible]);

  // 🚫 Lista básica de sitios comunes que bloquean iframes
  const blockedDomains = [
    "reddit.com",
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "tiktok.com",
    "linkedin.com",
  ];

  const isBlockedDomain = (inputUrl) => {
    try {
      const host = new URL(inputUrl).hostname.replace("www.", "");
      return blockedDomains.some((domain) => host.includes(domain));
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!url.startsWith("http")) {
      setError("Please enter a valid URL starting with http or https.");
      return;
    }

    if (isBlockedDomain(url)) {
      setError("This website doesn't allow embedding in iframes.");
      return;
    }

    await updateDoc(ref, {
      "contenido.title": title,
      "contenido.url": url,
    });

    setError("");
    onHide();
  };

  return (
    <Dialog
      header="Edit Iframe"
      visible={visible}
      onHide={onHide}
      style={{ width: "30rem" }}
      className="p-fluid"
    >
      {error && <Message severity="warn" text={error} className="mb-3" />}

      <div className="p-field mt-3">
        <label>Title</label>
        <InputText value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="p-field mt-3">
        <label>URL to embed</label>
        <InputText value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>

      <Button label="Save" className="btn-pistacho mt-4" onClick={handleSave} />
    </Dialog>
  );
}
