import React, {useContext} from "react";
import {useNavigate} from "react-router-dom";
import {UserContext} from "../UserContext";

function Logout() {
    const {state, dispatch} = useContext(UserContext);
    const navigate = useNavigate();
    dispatch({type:"USER", payload:false})
    navigate("/");
}

export default Logout;