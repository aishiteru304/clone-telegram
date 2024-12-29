import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Notification {
    conversation: string[];
}

const initialState: Notification = {
    conversation: [],
};

export const notification = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addConversation: (state, action: PayloadAction<string[]>) => {
            state.conversation = [...action.payload];
        },
    },
})

// Action creators are generated for each case reducer function
export const { addConversation } = notification.actions

export default notification.reducer