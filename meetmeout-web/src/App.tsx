import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './auth/Login'
import MainFeed from './components/MainFeed'
import Register from './auth/Register'
import UserProfile from './components/UserProfile'
import UserCompanions from './components/UserCompanions'
import MainLayout from './components/MainLayout'
import CreateEvent from './components/CreateEvent'

function App() {

  return (
    <>
    <Router>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>

            <Route path="/" element={<MainLayout/>}>
              <Route path="/main-feed" element={<MainFeed/>} />
              <Route path="/user-profile/:username" element={<UserProfile />} />
              <Route path=":username/companions/" element={<UserCompanions/>} />
              <Route path="/create-event" element={<CreateEvent/>} />
            </Route>
        </Routes>  
    </Router>
    </>
  )
}

export default App
