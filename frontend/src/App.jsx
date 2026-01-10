import { Route, Routes } from "react-router-dom"
import PoliceLiveDashboard from "./pages/PoliceLiveDashboard"
import Home from "./pages/Home"
import Signin from "./pages/Signin"
import Sos from "./pages/Sos"
import Report from "./pages/Report"
import Setting from "./pages/Setting"
import ActiveSos from "./pages/ActiveSos"
import SosRing from "./pages/SosRing"
import Safetyscore from "./pages/Safetyscore"
import Chatbot from "./pages/Chatbot"
import FriendMapPage from "./pages/FriendMapPage"
import ScrollToHashElement from "./components/ScrollToHashElement"

const App = () => {
  return (
    <>
    <ScrollToHashElement/>
    <Routes>
      <Route path="/" element={<Signin />} />
      <Route path="/home" element={<Home />} />
      <Route path="/sos" element={<Sos />} />
      <Route path="/reports" element={<Report />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/activeSos" element={<ActiveSos />} />
      <Route path="/sos-ring" element={<SosRing />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/safescore" element={<Safetyscore />} />
      <Route path="/friend-map" element={<FriendMapPage />} />
      <Route path="/police-dashboard" element={<PoliceLiveDashboard />} />
    </Routes>
    </>
  )
}

export default App
