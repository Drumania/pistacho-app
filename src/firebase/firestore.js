import { getFirestore } from "firebase/firestore";
import { app } from "./config"; // ahora sí funciona bien

const db = getFirestore(app);
export default db;
