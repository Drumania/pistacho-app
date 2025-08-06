export const getUserAvatar = (user) => {
  if (!user) return "/avatar_placeholder.png";
  return (
    user.photoURL || // subida por Settings
    user.providerData?.[0]?.photoURL || // la de Google
    "/avatar_placeholder.png"
  );
};
