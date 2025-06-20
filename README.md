## ⚠️ Note on Commit History

All developments in this project were carried out solely by me.  
However, due to a previous `git rebase` and `--reset-author` operation, the original commit dates were unintentionally overwritten and set to the same day (May 4th, 2025).

# MeetMeOut 🌍🎉  
A web-based event management platform for discovering, joining, and organizing events with advanced features like live chat, map routing, and carpool coordination.

## 🚀 About the Project

**MeetMeOut** is a full-stack event management application that enables users to:

- Create and discover local events  
- Join events and communicate with participants  
- Share location and organize carpooling  
- View event routes on a map  
- Rate events and organizers  
- Receive real-time notifications and chat updates  

The system supports secure user authentication, role-based access, and a mobile-responsive user interface.

---

## 🛠️ Tech Stack

### Frontend
- **React (TypeScript)**  
- **React Router**  
- **CSS Modules**  
- **Leaflet & OpenRouteService API** (for map and routing)  
- **WebSocket (native wss protocol)** (real-time chat & notifications)

### Backend
- **Spring Boot (Java)**  
- **Spring Security + JWT**  
- **WebSocket (SimpMessagingTemplate)**  
- **PostgreSQL**  
- **RESTful API**  
- **Multipart support for image uploads**

---

## 📁 Project Structure

### `meetmeout-web/`
- `/auth`: Login, register, password flows  
- `/components`: Layouts, feeds, and reusable views  
- `/features`: Modular domains (event, user, comment, review, etc.)  
- `/context`: Custom providers (dark mode, location, notification, etc.)  
- `/map`: Leaflet-based interactive maps  
- `/utils`: Shared utilities  
- `/types`: DTOs and type declarations  

### `meetmeout-server/`
- `/auth`, `/event`, `/companion`, ... : Feature-based logic  
- `/controller`, `/service`, `/model`: Clean layered architecture  
- `/common`: Shared logic and global helpers  
- `/wsrelay`: WebSocket notification infrastructure  
- `/config`: CORS, JWT, WebSocket, Security configs  

---

## ⚙️ Features

- 🔐 Secure JWT authentication & authorization  
- 🗺️ Interactive map for event location and routing  
- 💬 Real-time chat in events (WebSocket)  
- 📱 Fully responsive mobile-first design  
- 🚗 Carpool system with seat management  
- 📅 Calendar-based event tracking  
- 🔔 Live notification system  
- ⭐ Rating & feedback for events and organizers  

---


## 🧪 Testing

- Backend endpoints tested via **autocannon** and load testing is done via **k6**  
- Manual UI testing done for:
  - Registration/Login/Logout
  - Event creation & attendance
  - Carpool assignment
  - Messaging and notifications  

---

## 🧩 How to Run

### Backend
cd meetmeout-server
./mvnw spring-boot:run

### Backend WS
cd meetmeout-ws/meetmeout-ws
./mvnw spring-boot:run


### Frontend
cd meetmeout-web
npm install
npm start


