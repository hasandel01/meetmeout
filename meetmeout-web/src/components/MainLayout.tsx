import { Outlet } from "react-router-dom";
import Header from "./Header";
import "../styles/MainLayout.css";

const MainLayout = () => {
    return (
        <div className="app-wrapper">
            <Header />
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
