import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './auth/Login'
import MainFeed from './components/MainFeed/MainFeed'
import Register from './auth/Register'
import UserProfile from './features/user/UserProfile/UserProfile'
import UserCompanions from './features/user/UserCompanions/UserCompanions'
import MainLayout from './components/MainLayout/MainLayout'
import CreateEvent from './features/event/CreateEvent/CreateEvent'
import EventDetails from './features/event/EventDetails/EventDetails'
import ProtectedRoute from './auth/ProtectedRoute'
import VerifyEmail from './auth/VerifyEmail'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


function App() {

  return (
    <>
    <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
    <Router>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/verify" element={<VerifyEmail/>}/>

            <Route path="/"
            element={
            <ProtectedRoute>
                <MainLayout/>
            </ProtectedRoute>}>    
            <Route path="/main-feed" element={
              <ProtectedRoute>
                <MainFeed/>
              </ProtectedRoute>
            }/>
            <Route path="/user-profile/:username" 
            element={
              <ProtectedRoute>
                <UserProfile/>
              </ProtectedRoute>
            } />
            <Route path=":username/companions/" 
            element={
              <ProtectedRoute>
                <UserCompanions/>
              </ProtectedRoute>
            }/>
            <Route path="/create-event" 
            element={
              <ProtectedRoute>
                <CreateEvent/>
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId" 
            element={
              <ProtectedRoute>
                <EventDetails/>
              </ProtectedRoute>
            } />
            </Route>
        </Routes>  
    </Router>
    </>
  )
}

export default App
