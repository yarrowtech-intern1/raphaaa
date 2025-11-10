import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import Home from '../../pages/Home'
import { Outlet } from 'react-router-dom'
import ScrollToTopButton from '../Common/ScrollToTopButton'

const UserLayout = () => {
  return (
    <>
      <Header/>
      {/* main hero section */}
      <main>
        <Outlet/>
      </main>
      <Footer/>
      <ScrollToTopButton/>
    </>
  )
}

export default UserLayout
