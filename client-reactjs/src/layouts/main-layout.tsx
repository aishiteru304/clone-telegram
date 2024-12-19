import { Outlet, useNavigate } from "react-router-dom"
import SearchComponent from "../components/common/search"
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