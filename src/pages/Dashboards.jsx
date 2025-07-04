import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import HeaderDashboard from "@/components/HeaderDashboard";

import InviteMemberDialog from "@/components/InviteMemberDialog";
import EditGroupDialog from "@/components/EditGroupDialog";
import AddWidgetDialog from "@/components/AddWidgetDialog";

import db from "@/firebase/firestore";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

const ResponsiveGridLayout = WidthProvider(Responsive);
const widgetModules = import.meta.glob("@/widgets/*/*.jsx", { eager: true });

export default function Dashboards() {
  const { groupId } = useParams();
  const { user, showToast } = useAuth();

  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(1200);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  const [layouts, setLayouts] = useState({ lg: [] });
  const [widgetInstances, setWidgetInstances] = useState([]);
  const [components, setComponents] = useState({});

  const isAdmin = user?.admin;

  const [groupData, setGroupData] = useState({
    name: "",
    photoURL: "",
  });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 20);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadGroupData = async () => {
      const ref = doc(db, "groups", groupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setGroupData({
          name: data.name || "",
          photoURL: data.photoURL || "",
        });
      }
    };
    if (groupId) loadGroupData();
  }, [groupId]);

  useEffect(() => {
    const checkGroupAdmin = async () => {
      if (!groupId || !user?.uid) return;

      const memberRef = doc(db, "groups", groupId, "members", user.uid);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) {
        const memberData = memberSnap.data();
        setIsGroupAdmin(memberData.admin === true);
      } else {
        setIsGroupAdmin(false);
      }
    };

    checkGroupAdmin();
  }, [groupId, user?.uid]);

  useEffect(() => {
    fetchWidgets();
  }, [groupId]);

  const fetchWidgets = async () => {
    setIsLoading(true);
    const snapshot = await getDocs(collection(db, `groups/${groupId}/widgets`));
    const widgets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setWidgetInstances(widgets);

    const layoutLg = widgets.map((w) => ({
      i: w.id,
      x: w.layout?.x || 0,
      y: w.layout?.y || 0,
      w: w.layout?.w || 1,
      h: w.layout?.h || 1,
    }));

    setLayouts({ lg: layoutLg });

    const componentsMap = {};
    for (const widget of widgets) {
      const path = `/src/widgets/${widget.key}/${widget.key}.jsx`;
      const mod = widgetModules[path];
      if (mod) {
        componentsMap[widget.id] = mod.default;
      } else {
        console.warn("No module found for:", path);
      }
    }

    setComponents(componentsMap);
    setIsLoading(false);
  };

  const handleLayoutChange = async (currentLayout, allLayouts) => {
    setLayouts(allLayouts);

    if (!editMode) return;

    for (const w of currentLayout) {
      await updateDoc(doc(db, `groups/${groupId}/widgets/${w.i}`), {
        layout: { x: w.x, y: w.y, w: w.w, h: w.h },
      });
    }
  };

  const handleSaveTemplate = async () => {
    const name = prompt("Template name:");
    if (!name) return;

    const widgetsForTemplate = widgetInstances.map((w) => {
      const layout = layouts.lg.find((l) => l.i === w.id);
      return {
        key: w.key,
        layout: layout || { x: 0, y: 0, w: 1, h: 1 },
        settings: w.settings || {},
      };
    });

    const templateData = {
      name,
      description: "",
      created_by: user?.uid,
      created_at: serverTimestamp(),
      widgets: widgetsForTemplate,
    };

    try {
      await addDoc(collection(db, "templates"), templateData);
      showToast?.("success", "Saved", "Template saved successfully");
    } catch (err) {
      console.error("Error saving template:", err);
      showToast?.("error", "Error", "Failed to save template");
    }
  };

  return (
    <div className="container-fluid" ref={containerRef}>
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <HeaderDashboard
            key={groupId}
            groupName={groupData.name}
            groupPhoto={groupData.photoURL}
            isAdmin={isGroupAdmin}
            widgetInstances={widgetInstances}
            handleSaveTemplate={handleSaveTemplate}
            setShowInviteDialog={setShowInviteDialog}
            setShowEditDialog={setShowEditDialog}
            editMode={editMode}
            setEditMode={setEditMode}
            setShowAddWidgetDialog={setShowAddWidgetDialog}
          />

          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ xl: 1600, lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ xl: 5, lg: 4, md: 3, sm: 2, xs: 1 }}
            rowHeight={250}
            width={containerWidth}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".widget-handle"
            isDraggable={editMode}
            isResizable={editMode}
            compactType={null}
            preventCollision={true}
          >
            {layouts.lg.map((l) => {
              const widget = widgetInstances.find((w) => w.id === l.i);
              const WidgetComponent = components[widget?.id];

              const handleDelete = async () => {
                await deleteDoc(
                  doc(db, `groups/${groupId}/widgets/${widget.id}`)
                );
                fetchWidgets();
              };

              return (
                <div key={l.i}>
                  <div
                    className={
                      editMode ? "widget-content wc-edit" : "widget-content"
                    }
                  >
                    {editMode && (
                      <div className="wc-edit-cont">
                        <div className="widget-handle">
                          <i className="bi bi-grip-vertical"></i>
                        </div>

                        <div
                          className="widget-delete"
                          onClick={handleDelete}
                          title="Delete widget"
                        >
                          <i className="bi bi-trash" />
                        </div>
                      </div>
                    )}
                    {WidgetComponent ? (
                      <WidgetComponent
                        groupId={groupId}
                        widgetId={widget.id}
                        {...widget.settings}
                      />
                    ) : (
                      <div className="p-2 text-muted">Widget not found</div>
                    )}
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>

          {widgetInstances.length === 0 && (
            <div className="dashboard-empty">
              <h3 className="pe-5">
                <i className="bi bi-arrow-up"></i>
              </h3>
              Click "Add Widget" to get started.
            </div>
          )}
        </>
      )}

      <InviteMemberDialog
        groupId={groupId}
        visible={showInviteDialog}
        onHide={() => setShowInviteDialog(false)}
      />

      <EditGroupDialog
        groupId={groupId}
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        onGroupUpdated={(updated) =>
          setGroupData((prev) => ({ ...prev, ...updated }))
        }
      />

      <AddWidgetDialog
        visible={showAddWidgetDialog}
        onHide={() => setShowAddWidgetDialog(false)}
        groupId={groupId}
        onWidgetAdded={fetchWidgets}
      />
    </div>
  );
}
