import { AppRouter } from "@app/router";
import { useFirebaseHydration } from "@features/persistence/useFirebaseHydration";

const App = () => {
  useFirebaseHydration();

  return <AppRouter />;
};

export default App;
