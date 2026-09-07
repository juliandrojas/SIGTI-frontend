import { Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout/>}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>

  );
}
export default App;