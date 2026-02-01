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
import { EmailBox} from "./components/ui/ForgetBoxes";
import { OTPPasswordBox } from "./components/ui/ForgetPasswordBox";
import { SettingsLayout } from "./layout/SettingsLayout";
import Profile from "./Pages/Profile";
import SecurityPage from "./Pages/SecurityPage";
import BrainDashboard from "./Pages/BrainDashboard";
import { AskAI } from "./Pages/AskAI";
import NotFound from "./Pages/NotFound";
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
            <Route path="/forgot-password" element={<EmailBox />} />
            <Route path="/forgot-password/verify" element={<OTPPasswordBox />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:brain" element={<BrainDashboard />} />
            <Route path="/add-content" element={<AddContent />} />
            <Route path="/askai" element={<AskAI />} />
          </Route>
          <Route element={<SettingsLayout />}>
            <Route path="/settings" element={<Profile />} />
            <Route path="/settings/account" element={<Profile />} />
            <Route path="/settings/security" element={<SecurityPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
