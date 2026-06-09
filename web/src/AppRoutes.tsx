import { Navigate, Route, Routes } from "react-router-dom"
import NotFound from "@/pages/NotFound"
import DynamicPage from "@/pages/DynamicPage"

const AppRoutes = () => {   
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/:pageName" element={<DynamicPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
