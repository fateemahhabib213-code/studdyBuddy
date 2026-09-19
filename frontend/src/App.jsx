import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Review from "./pages/Review";
import Flashcards from "./pages/Flashcards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/review" element={<Review />} />
          <Route path="/flashcards" element={<Flashcards />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
