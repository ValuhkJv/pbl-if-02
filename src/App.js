import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AuthHandler from './components/AuthHandler';


export default function App() {
  return (
    <Router>
      <AuthHandler />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
