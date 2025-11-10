import axios from "axios"

const registerEndpoint='http://localhost:5001/user/register';
const loginEndpoint='http://localhost:5001/user/login';

const authRegister = async (userData) => {
    const response = await axios.post(registerEndpoint, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }
}

const authLogin = async (userData) => {
    const response = await axios.post(loginEndpoint, userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }
}

const logout = () => {
    localStorage.removeItem('user')
  }

const authService={
    authRegister,
    authLogin,
    logout
}

export default authService;
