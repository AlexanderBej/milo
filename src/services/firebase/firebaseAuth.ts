import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebaseClient";

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
