import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavbarLayout from "./components/ui/NavbarLayout";
import { ThemeProvider } from "./hooks/themeContext";
import { Contact } from "./Pages/contact";
import Dashboard from "./Pages/Dashboard";
import LandingPage from "./Pages/Landing";
import Signin from "./Pages/Signin";
import Signup from "./Pages/Signup";
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<NavbarLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/landing" element={<LandingPage />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path=":brain" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
