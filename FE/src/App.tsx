import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { OTPBox } from "./components/ui/OTPBox";
import { ThemeProvider } from "./hooks/themeContext";
import { DashboardLayout } from "./layout/DashboardLayout";
import NavbarLayout from "./layout/NavbarLayout";
import AddContent from "./Pages/AddContent";
import { Contact } from "./Pages/contact";
import Dashboard from "./Pages/Dashboard";
import LandingPage from "./Pages/Landing";
import Signin from "./Pages/Signin";
import Signup from "./Pages/Signup";
function App() {
  return (
    <ThemeProvider>
      <Analytics />
      <BrowserRouter>
        <Routes>
          <Route element={<NavbarLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/verify" element={<OTPBox />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/landing" element={<LandingPage />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:brain" element={<Dashboard />} />
            <Route path="/add-content" element={<AddContent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
