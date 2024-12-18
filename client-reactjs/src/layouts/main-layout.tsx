import { Outlet } from "react-router-dom"
import SearchComponent from "../components/common/search"

const MainLayout = () => {
    return (
        <main className="flex h-screen">
            <section className="w-[30%] p-4">
                <SearchComponent />
            </section>
            <section className="w-[70%] bg-[url('/bg.jpg')] bg-cover bg-center">
                <Outlet />
            </section>
        </main>
    )
}

export default MainLayout