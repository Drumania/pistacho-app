import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useDocTitle } from "@/hooks/useDocTitle";
import { useGroupAccessGuard } from "@/hooks/useGroupAccessGuard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import HeaderDashboard from "@/components/HeaderDashboard";
import InviteMemberDialog from "@/components/InviteMemberDialog";
import EditGroupDialog from "@/components/EditGroupDialog";
import AddWidgetDialog from "@/components/AddWidgetDialog";

import db from "@/firebase/firestore";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/firebase/AuthContext";

const ResponsiveGridLayout = WidthProvider(Responsive);
const widgetModules = import.meta.glob("@/widgets/*/*.jsx", { eager: true });

export default function Dashboards() {
  const { groupId } = useParams();
  const {
    loading: groupLoading,
    hasAccess,
    groupData,
  } = useGroupAccessGuard(groupId);

  const { user } = useAuth();
  const [, setDocumentTitle] = useDocTitle("Dashboard");

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
  const [isProfileGroup, setIsProfileGroup] = useState(false);

  const PROFILE_WIDGET_KEY = "Profile";
  const PROFILE_WIDGET_ID = "autogen-profile";
  const isAdmin = user?.admin;

  // 📏 Resize listener
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

  // 🧹 Limpia estados cuando cambia de grupo
  useEffect(() => {
    setWidgetInstances([]);
    setLayouts({ lg: [] });
    setComponents({});
    setIsGroupAdmin(false);
    setIsProfileGroup(false);
  }, [groupId]);

  // 📄 Setea título del documento
  useEffect(() => {
    if (groupData?.name) {
      setDocumentTitle(groupData.name);
    }
  }, [groupData?.name]);

  // 🧠 Detecta si el grupo es de tipo Profile
  useEffect(() => {
    setIsProfileGroup(groupData?.isProfileGroup === true);
  }, [groupData]);

  // 🔐 Checkea si el usuario es admin y carga los widgets
  useEffect(() => {
    const initGroup = async () => {
      if (!groupId || groupLoading || !groupData || !user?.uid) return;

      try {
        const memberRef = doc(db, "groups", groupId, "members", user.uid);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
          setIsGroupAdmin(memberSnap.data()?.admin === true);
        }
      } catch (err) {
        console.warn("Error checking group admin:", err);
        setIsGroupAdmin(false);
      }

      fetchWidgets();
    };

    initGroup();
  }, [groupId, groupLoading, groupData, user?.uid]);

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
      let mod;

      const path = `/src/widgets/${widget.key}/${widget.key}.jsx`;
      mod = widgetModules[path];

      if (mod) {
        componentsMap[widget.id] = mod.default;
      } else {
        console.warn("No module found for:", widget.key);
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
    if (!user || !groupId || !widgetInstances.length) return;
    const templateName = prompt("Enter a name for this template:");
    if (!templateName) return;
    try {
      const widgetsData = widgetInstances
        .filter((w) => w?.key)
        .map((w) => ({
          widgetId: w.key,
          settings: w.settings ?? {},
          layout: w.layout ?? {},
        }));
      if (!widgetsData.length) {
        alert("❌ No widgets found to save. Please check your configuration.");
        return;
      }
      await addDoc(collection(db, "templates"), {
        name: templateName,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        widgets: widgetsData,
      });
      console.log("✅ Template saved!");
    } catch (err) {
      console.error("❌ Error saving template:", err);
    }
  };

  if (groupLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center my-5">
        <h3>🚫 You don't have access to this group.</h3>
        <p>Please check the URL or contact the group admin.</p>
      </div>
    );
  }

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
            isAdmin={isAdmin}
            isGroupAdmin={isGroupAdmin}
            groupName={groupData.name}
            groupPhoto={groupData.photoURL}
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
            cols={{ xl: 4, lg: 4, md: 3, sm: 2, xs: 1 }}
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
                        {widget?.id !== PROFILE_WIDGET_ID && (
                          <div
                            className="widget-delete"
                            onClick={handleDelete}
                            title="Delete widget"
                          >
                            <i className="bi bi-trash" />
                          </div>
                        )}
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
        onGroupUpdated={(updated) => {
          console.log("group updated", updated);
        }}
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
