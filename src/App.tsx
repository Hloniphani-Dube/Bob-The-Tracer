import { Route, Routes } from 'react-router-dom'
import { OrbitNav } from './components/nav/OrbitNav'
import { InvestigationPage } from './pages/InvestigationPage'
import { LandingPage } from './pages/LandingPage'
import { NewsPage } from './pages/NewsPage'

// OrbitNav is mounted once here, outside the route switch, since it is the
// app's persistent navigation and stays available from every page.
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/investigate" element={<InvestigationPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
      <OrbitNav />
    </>
  )
}

export default App
