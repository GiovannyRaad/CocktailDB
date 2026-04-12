import "./App.css";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Recipe from "./pages/Recipe";
import { Toaster } from "react-hot-toast";

function App() {
  const isDashboardPage = window.location.pathname.startsWith("/dashboard");
  const isLoginPage = window.location.pathname.startsWith("/login");
  const isMenuPage = window.location.pathname.startsWith("/menu");
  const isRecipePage = window.location.pathname.startsWith("/recipe/");

  return (
    <>
      <Toaster position="top-right" />
      {isDashboardPage ? (
        <Dashboard />
      ) : isLoginPage ? (
        <Login />
      ) : isMenuPage ? (
        <Menu />
      ) : isRecipePage ? (
        <Recipe />
      ) : (
        <Homepage />
      )}
    </>
  );
}

export default App;
