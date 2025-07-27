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

export default function NewsAdminPanel() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [news, setNews] = useState([]);

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

  const handleCreateNews = async () => {
    if (!title) return;

    let imageUrl = null;

    if (imageFile) {
      const storage = getStorage();
      const imageRef = ref(storage, `news/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const newDoc = await addDoc(collection(db, "news"), {
      title,
      content,
      image: imageUrl || null,
      created_at: serverTimestamp(),
    });

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
          title,
          short: content?.replace(/<[^>]+>/g, "").slice(0, 100) || "",
        },
      });
    }

    // reset
    setTitle("");
    setContent("");
    setImageFile(null);
    fetchNews();
  };

  const onRowEditComplete = async (e) => {
    const { newData, index } = e;
    const docRef = doc(db, "news", newData.id);
    await updateDoc(docRef, {
      title: newData.title,
      content: newData.content,
      updated_at: serverTimestamp(),
    });

    const updated = [...news];
    updated[index] = newData;
    setNews(updated);
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

  const renderHeader = () => {
    return (
      <span className="ql-formats">
        <button className="ql-bold" aria-label="Bold"></button>
        <button className="ql-italic" aria-label="Italic"></button>
        <button className="ql-underline" aria-label="Underline"></button>
      </span>
    );
  };

  const header = renderHeader();

  const actionsBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      className="p-button-text p-button-danger"
      onClick={() => handleDelete(rowData)}
    />
  );

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

            <Button className="btn btn-primary mb-4" onClick={handleCreateNews}>
              Publish News
            </Button>
          </div>
        </div>
      </details>

      <hr />
      <h5 className="mb-3">Manage Existing News</h5>
      <DataTable
        value={news}
        editMode="row"
        dataKey="id"
        onRowEditComplete={onRowEditComplete}
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
          editor={(options) => (
            <InputText
              type="text"
              value={options.rowData.content}
              onChange={(e) =>
                options.editorCallback({
                  ...options.rowData,
                  content: e.target.value,
                })
              }
            />
          )}
        />

        <Column
          field="image"
          header="Image"
          body={imageBodyTemplate}
          style={{ width: "80px" }}
        />

        <Column rowEditor header="Edit" style={{ width: "100px" }} />

        <Column
          header="Delete"
          body={actionsBodyTemplate}
          style={{ width: "80px" }}
        />
      </DataTable>
    </div>
  );
}
