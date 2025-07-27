// src/utils/notificationUtils.js

export function renderNotificationMessage(notif) {
  const { type, data } = notif;

  switch (type) {
    case "group_invite":
      return `${data.fromName} invited you to the group ${data.groupName}`;
    case "news":
      return `Focuspit News: ${data.title}`;
    case "admin_granted":
      return `${data.fromName} made you an admin in the group ${data.groupName}`;
    case "admin_revoked":
      return `${data.fromName} removed your admin privileges in the group ${data.groupName}`;
    case "group_removed":
      return `${data.fromName} removed you from the group ${data.groupName}`;
    case "comment":
      return `${data.fromName} commented in ${data.groupName}: "${data.comment}"`;
    case "reminder":
      return `Reminder: ${data.title} in ${data.groupName}`;
    case "todo_mention":
      return `${data.from} mentioned you in a task: "${data.todoTitle}"`;
    default:
      return `New notification`;
  }
}

export function getNotificationIcon(type) {
  switch (type) {
    case "group_invite":
      return "pi pi-users";
    case "news":
      return "pi pi-file";
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
