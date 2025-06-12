import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
    return (
        <div className={styles.appWrapper} id="AppWrapper">
            <Header />
            <main className={styles.content}>
                <Outlet />
            </main>
            <Footer></Footer>
        </div>
    );
}

export default MainLayout;
