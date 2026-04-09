import "./App.css";
import Homepage from "./pages/Homepage";
import Menu from "./pages/Menu";

function App() {
  const isMenuPage = window.location.pathname.startsWith("/menu");

  return isMenuPage ? <Menu /> : <Homepage />;
}

export default App;
