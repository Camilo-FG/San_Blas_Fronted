import { useState } from 'react'
import './App.css'
import Navbar from './shared/components/Navbar'
import Home from './modules/landing/pages/HomePage'
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes/router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()
function App() {


  return (
    <>
     <QueryClientProvider client={queryClient}>
       <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
}

export default App
