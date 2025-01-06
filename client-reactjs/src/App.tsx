import { Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/main-layout"
import HomePage from "./pages/home"
import LoginPage from "./pages/login"
import ChatPage from "./pages/friend"
import RegisterPage from "./pages/register"
import ConverSationPage from "./pages/conversation"
import ConversationGroupPage from "./pages/conversation/group"

function App() {

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route path="/friend/:id" element={<ChatPage />} />
        <Route path="/conversation/:id" element={<ConverSationPage />} />
        <Route path="/group/:id" element={<ConversationGroupPage />} />
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default App
