// utils/fetchMetadata.js
const apiKey = import.meta.env.VITE_LINKPREVIEW_API_KEY;

export const fetchMetadata = async (url) => {
  try {
    const res = await fetch(
      `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`
    );
    const data = await res.json();
    console.log(data);
    if (data.error || !data.title) throw new Error("Metadata fetch failed");

    return {
      title: data.title || url,
      description: data.description || "",
      image: data.image || "",
    };
  } catch (err) {
    console.error("Error fetching metadata:", err);
    return {
      title: url,
      description: "",
      image: "",
    };
  }
};
