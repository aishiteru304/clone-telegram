import { IoMenu } from "react-icons/io5";

const SearchComponent = () => {
    return (
        <search className="flex gap-2 items-center ">
            <IoMenu className="text-2xl cursor-pointer" />
            <input placeholder="Search" className="w-full bg-gray-200 outline-none pl-4 py-2 rounded-3xl" />
        </search>
    )
}

export default SearchComponent