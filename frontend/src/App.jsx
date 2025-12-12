import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UserSignup from './pages/UserSignup'
import HelperSignup from './pages/HelperSignup'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup/user" element={<UserSignup />} />
        <Route path="/signup/helper" element={<HelperSignup />} />
      </Routes>
      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        theme="light" 
      />
    </>
  )
}

export default App