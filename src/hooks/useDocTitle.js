import { useEffect, useState } from "react";

const useDocTitle = (title) => {
  const [documentTitle, setDocumentTitle] = useState(title);
  useEffect(() => {
    document.title = "FocusPit | " + documentTitle;
  }, [documentTitle]);

  return [documentTitle, setDocumentTitle];
};

export { useDocTitle };
