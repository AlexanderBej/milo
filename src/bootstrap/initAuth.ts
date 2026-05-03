import { onAuthStateChanged, type User } from "firebase/auth";

import { store } from "@app/store";
import { finishAuthLoading, setUser, type AuthUser } from "@features/auth";
import { auth } from "@services/firebase/firebaseAuth";

let isInitialized = false;

const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL,
});

export const initAuth = () => {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  if (!auth) {
    store.dispatch(finishAuthLoading());
    return;
  }

  onAuthStateChanged(auth, (user) => {
    store.dispatch(setUser(user ? toAuthUser(user) : null));
  });
};
