import { useState } from "react";
import { signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "@services/firebase/firebaseAuth";
import { Button } from "@shared/components/Button";
import styles from "./AuthPage.module.scss";

export const AuthPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = () => {
    if (!auth || isSigningIn) {
      return;
    }

    setErrorMessage(null);
    setIsSigningIn(true);

    void signInWithPopup(auth, googleProvider)
      .catch((error: unknown) => {
        console.error("Sign-in failed", error);
        setErrorMessage("Google sign-in failed. Please try again.");
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>M</div>
          <div>
            <h1 className={styles.title}>MILO</h1>
            <p className={styles.subtitle}>Command center</p>
          </div>
        </div>

        <p className={styles.description}>
          A calm place to think, plan, and act.
        </p>

        <Button
          className={styles.googleButton}
          disabled={!auth || isSigningIn}
          onClick={handleGoogleSignIn}
          size="md"
        >
          {isSigningIn ? "Opening Google..." : "Continue with Google"}
        </Button>
        {errorMessage ? (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
};
