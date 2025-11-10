import React from "react";

import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";
import * as RiIcons from "react-icons/ri";

export const SidebarData = [
    {
        title: 'Home',
        path: '/',
        icon: <AiIcons.AiFillHome />,
        cName: 'nav-text'
    },
    
    {
        title: 'Login',
        path: '/login',
        icon: <MdIcons.MdLogin />,
        cName: 'nav-text'
    },
    {
        title:'Register',
        path: '/register',
        icon: <MdIcons.MdLogin />,
        cName: 'nav-text'
    }
    
]

export const loggedInData = [
    {
        title: 'Home',
        path: '/',
        icon: <AiIcons.AiFillHome />,
        cName: 'nav-text'
    },
    {
        title: 'Create New Chat ',
        path: '/newchatpage',
        icon: <BsIcons.BsFillChatDotsFill />,
        cName: 'nav-text'
    },
    {
        title: 'Chat History',
        path: '/chathistory',
        icon: <RiIcons.RiChatHistoryLine />,
        cName: 'nav-text'
    },
    {
        title: 'Logout',
        path: '/logout',
        icon: <MdIcons.MdLogin />,
        cName: 'nav-text'
    },
]