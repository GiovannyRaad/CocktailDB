import "./App.css";
import Homepage from "./pages/Homepage";
import Menu from "./pages/Menu";
import { Toaster } from "react-hot-toast";

function App() {
  const isMenuPage = window.location.pathname.startsWith("/menu");

  return (
    <>
      <Toaster position="top-right" />
      {isMenuPage ? <Menu /> : <Homepage />}
    </>
  );
}

export default App;
