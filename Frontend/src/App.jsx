import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import StatsBanner from './components/StatsBanner'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <StatsBanner />
      </main>
      <Footer />
    </div>
  )
}

export default App
