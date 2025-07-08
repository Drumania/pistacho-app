// src/utils/notificationUtils.js

export function renderNotificationMessage(notif) {
  const { type, data } = notif;

  switch (type) {
    case "group_invite":
      return `${data.fromName} te invitó al grupo ${data.groupName}`;
    case "admin_granted":
      return `${data.fromName} te asignó como admin en el grupo ${data.groupName}`;
    case "admin_revoked":
      return `${data.fromName} te quitó los permisos de admin en el grupo ${data.groupName}`;
    case "group_removed":
      return `${data.fromName} te removió del grupo ${data.groupName}`;
    case "comment":
      return `${data.fromName} comentó en ${data.groupName}: "${data.comment}"`;
    case "reminder":
      return `Recordatorio: ${data.title} en ${data.groupName}`;
    case "todo_mention":
      return `${data.from} te mencionó en una tarea: "${data.todoTitle}"`;
    default:
      return `Notificación nueva`;
  }
}

export function getNotificationIcon(type) {
  switch (type) {
    case "group_invite":
      return "pi pi-users";
    case "comment":
      return "pi pi-comment";
    case "reminder":
      return "pi pi-calendar";
    case "todo_mention":
      return "pi pi-at";
    case "admin_granted":
      return "pi pi-user-plus";
    case "admin_revoked":
      return "pi pi-user-minus";
    default:
      return "pi pi-bell";
  }
}
