import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db from "@/firebase/firestore";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export default function NewsAdminPanel() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [news, setNews] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const snap = await getDocs(collection(db, "news"));
    const data = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.created_at?.seconds - a.created_at?.seconds);
    setNews(data);
  };

  const preparePreview = async () => {
    let imageUrl = null;

    if (imageFile) {
      const storage = getStorage();
      const imageRef = ref(storage, `news/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const preview = {
      title,
      content,
      image: imageUrl || null,
      link: link || null,
      created_at: serverTimestamp(),
    };

    setPreviewData(preview);
    setPreviewVisible(true);
  };

  const handlePublish = async () => {
    if (!previewData?.title) return;

    const newDoc = await addDoc(collection(db, "news"), previewData);

    const usersSnap = await getDocs(collection(db, "users"));
    for (const user of usersSnap.docs) {
      const userId = user.id;
      await addDoc(collection(db, "notifications"), {
        toUid: userId,
        type: "news",
        read: false,
        createdAt: serverTimestamp(),
        status: "pending",
        data: {
          news_id: newDoc.id,
          title: previewData.title,
          short:
            previewData.content?.replace(/<[^>]+>/g, "").slice(0, 100) || "",
        },
      });
    }

    // reset
    setTitle("");
    setContent("");
    setImageFile(null);
    setPreviewVisible(false);
    fetchNews();
  };

  const handleDelete = async (rowData) => {
    if (confirm(`Delete news "${rowData.title}"?`)) {
      await deleteDoc(doc(db, "news", rowData.id));
      fetchNews();
    }
  };

  const imageBodyTemplate = (rowData) =>
    rowData.image ? (
      <img
        src={rowData.image}
        alt="news"
        style={{ maxWidth: "60px", borderRadius: "6px" }}
      />
    ) : (
      "-"
    );

  const renderHeader = () => (
    <span className="ql-formats">
      <button className="ql-bold" aria-label="Bold"></button>
      <button className="ql-italic" aria-label="Italic"></button>
      <button className="ql-underline" aria-label="Underline"></button>
    </span>
  );

  const actionsBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      className="p-button-text p-button-danger"
      onClick={() => handleDelete(rowData)}
    />
  );

  const header = renderHeader();

  return (
    <div className="container">
      <details className="mb-5">
        <summary className="mb-3 fw-bold">Create News</summary>

        <div className="row">
          <div className="col-md-6 mt-3">
            <div className="mb-3">
              <label>Image (optional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            <div className="mb-3">
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Content (optional)</label>
              <Editor
                value={content}
                onTextChange={(e) => setContent(e.htmlValue)}
                headerTemplate={header}
                className="bg-white text-dark"
                style={{ height: "200px" }}
              />
            </div>

            <div className="mb-3">
              <label>Link (optional)</label>
              <input
                type="text"
                className="form-control"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <Button
              className="btn btn-outline-secondary"
              onClick={preparePreview}
            >
              Preview News
            </Button>
          </div>
        </div>
      </details>

      <Dialog
        header="Preview News"
        visible={previewVisible}
        style={{ width: "600px" }}
        onHide={() => setPreviewVisible(false)}
        footer={
          <Button
            label="Publish"
            className="btn btn-success"
            onClick={handlePublish}
          />
        }
      >
        {previewData && (
          <div>
            {previewData.image && (
              <img
                src={previewData.image}
                alt="preview"
                style={{ width: "100%", borderRadius: "8px" }}
                className="mb-3"
              />
            )}
            <h5>{previewData.title}</h5>
            <div dangerouslySetInnerHTML={{ __html: previewData.content }} />
          </div>
        )}
      </Dialog>

      <hr />
      <h5 className="mb-3">Manage Existing News</h5>
      <DataTable
        value={news}
        editMode="row"
        dataKey="id"
        responsiveLayout="scroll"
        className="p-datatable-sm"
      >
        <Column
          field="title"
          header="Title"
          editor={(options) => (
            <InputText
              type="text"
              value={options.rowData.title}
              onChange={(e) =>
                options.editorCallback({
                  ...options.rowData,
                  title: e.target.value,
                })
              }
            />
          )}
        />

        <Column
          field="content"
          header="Content"
          body={(rowData) =>
            rowData.content
              ? rowData.content.replace(/<[^>]+>/g, "").slice(0, 100) + "..."
              : "-"
          }
        />
        <Column
          field="image"
          header="Image"
          body={imageBodyTemplate}
          style={{ width: "80px" }}
        />

        <Column
          header="Delete"
          body={actionsBodyTemplate}
          style={{ width: "80px" }}
        />
      </DataTable>
    </div>
  );
}
