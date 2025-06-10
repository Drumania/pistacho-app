export const getUserAvatar = (user) => {
  if (!user) return "/default-avatar.png";
  return (
    user.photoURL || // subida por Settings
    user.providerData?.[0]?.photoURL || // la de Google
    "/default-avatar.png"
  );
};
