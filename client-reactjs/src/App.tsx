import { Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/main-layout"
import HomePage from "./pages/home"

function App() {

  return (
    <Routes>
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/" element={<MainLayout />}>
        {/* <Route path="/users/create" element={<CreateStaff />} />
        <Route path="/users/:id" element={<EditStaff />} />
        <Route path="/users" element={<StaffManagement />} />
        <Route path="/categories" element={<CategoryManagement />} /> */}
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default App
