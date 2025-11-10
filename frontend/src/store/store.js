import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../feature/login/loginSlice'

export default configureStore({
    reducer: {
        auth: authReducer
    }
})