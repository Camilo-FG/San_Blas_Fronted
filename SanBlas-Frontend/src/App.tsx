import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Navbar from './shared/components/Navbar'
import Home from './modules/landing/pages/HomePage'
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes/router";


function App() {


  return (
    <>
       <RouterProvider router={router} />

    </>
  )
}

export default App
