import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import AddLocation from "./pages/AddLocation";
import LocationDetail from "./pages/LocationDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddLocation />} />
          <Route path="/location/:id" element={<LocationDetail />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
