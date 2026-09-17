import { Route, Routes } from 'react-router-dom'
import { OrbitNav } from './components/nav/OrbitNav'
import { PublicNotice } from './components/PublicNotice'
import { InvestigationPage } from './pages/InvestigationPage'
import { LandingPage } from './pages/LandingPage'
import { NewsPage } from './pages/NewsPage'

// OrbitNav and PublicNotice are mounted once here, outside the route
// switch, so they show up regardless of which page is entered first.
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/investigate" element={<InvestigationPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
      <OrbitNav />
      <PublicNotice />
    </>
  )
}

export default App
