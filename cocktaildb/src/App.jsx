import "./App.css";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage";
import Menu from "./pages/Menu";
import { Toaster } from "react-hot-toast";

function App() {
  const isDashboardPage = window.location.pathname.startsWith("/dashboard");
  const isMenuPage = window.location.pathname.startsWith("/menu");

  return (
    <>
      <Toaster position="top-right" />
      {isDashboardPage ? <Dashboard /> : isMenuPage ? <Menu /> : <Homepage />}
    </>
  );
}

export default App;
