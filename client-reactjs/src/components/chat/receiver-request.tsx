
const ReceiverRequest = () => {
    return (
        <div className=" bg-white border-l-[1px] py-2">
            <p className="text-center">Accept friend request</p>
            <div className="flex gap-2 text-white justify-center mt-2">
                <button className="bg-primary px-2 py-1 rounded-md">Confirm</button>
                <button className="px-2 py-1 text-red-500 border-red-500 rounded-md border-[1px]">Cancel</button>
            </div>
        </div>
    )
}

export default ReceiverRequest