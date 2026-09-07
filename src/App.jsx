import { Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout/>}>
        <Route index element={<Home />} />
      </Route>
    </Routes>

  );
}
export default App;