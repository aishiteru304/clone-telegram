import { Outlet, useNavigate } from "react-router-dom"
import SideBar from "../components/common/side-bar"
import useLocalStorage from "../hooks/useLocalStorage"
import { useEffect } from "react"
import { ACCESSTOKEN_KEY } from "../app/constant"

const MainLayout = () => {
    const { getLocalStorage } = useLocalStorage()
    const navigate = useNavigate()

    useEffect(() => {
        const accessToken = getLocalStorage(ACCESSTOKEN_KEY)
        if (!accessToken) {
            navigate("/login")
        }
    }, [])

    return (
        <main className="flex h-screen">
            <section className="w-[30%] px-4">
                <SideBar />
            </section>
            <section className="w-[70%] bg-[url('/bg.jpg')] bg-cover bg-center overflow-y-hidden">
                <Outlet />
            </section>
        </main>
    )
}

export default MainLayout