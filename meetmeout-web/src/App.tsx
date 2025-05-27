import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './auth/Login'
import MainFeed from './components/MainFeed/MainFeed'
import Register from './auth/Register'
import UserProfile from './features/user/UserProfile/UserProfile'
import UserCompanions from './features/user/UserCompanions/UserCompanions'
import MainLayout from './components/MainLayout/MainLayout'
import CreateEventForm from './features/event/CreateEvent/CreateEventForm'
import EventDetails from './features/event/EventDetails/EventDetails'
import ProtectedRoute from './auth/common/ProtectedRoute'
import VerifyEmail from './auth/VerifyEmail'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Notifications from './features/notifications/Notifications'
import ForgotPassword from './auth/ForgotPassword'
import ResetPassword from './auth/ResetPassword'
import { NotificationProvider } from './context/NotificationContext'
import { UserContextProvider } from './context/UserContext'
import MyCalendar from './features/calendar/MyCalendar'
import { ProfileContextProvider } from './context/ProfileContext'
import { WebSocketProvider } from './context/WebSocketContext'
import UpdateEvent from './features/event/UpdateEvent/UpdateEvent'
import Settings from './features/user/Settings/Settings'
import { DarkModeContextProvider } from './context/darkModeContext'
import { LocationProvider } from './context/LocationContex'

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
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>

            <Route path="/"
            element={
            <ProtectedRoute>
              <UserContextProvider>
                <NotificationProvider>
                  <ProfileContextProvider>
                    <WebSocketProvider>
                      <DarkModeContextProvider>
                        <LocationProvider>
                            <MainLayout/>
                        </LocationProvider>
                      </DarkModeContextProvider>
                    </WebSocketProvider>
                  </ProfileContextProvider>
                </NotificationProvider>
              </UserContextProvider>
            </ProtectedRoute>}>    
            <Route path="/" element={
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
                <CreateEventForm/>
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId" 
            element={
              <ProtectedRoute>
                <EventDetails/>
              </ProtectedRoute>
            } />
              <Route path='/notifications'
                element= {
                  <ProtectedRoute>
                    <Notifications/>                
                    </ProtectedRoute>
                }/>
                <Route path='/my-calendar'
                element = {
                  <ProtectedRoute>
                      <MyCalendar/>
                  </ProtectedRoute>
                }/>
                <Route path='/update-event/:eventId'
                element = {
                  <ProtectedRoute>
                     <UpdateEvent/>
                  </ProtectedRoute>
                }/>
                <Route path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings/>
                  </ProtectedRoute>
                }/>
            </Route>
        </Routes>  
    </Router>
    </>
  )
}

export default App
