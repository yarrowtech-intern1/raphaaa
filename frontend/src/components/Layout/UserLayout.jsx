import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { Outlet } from 'react-router-dom'
import ScrollToTopButton from '../Common/ScrollToTopButton'
import WhatsAppWidget from '../Common/WhatsAppWidget'
import ExitIntentPopup from '../Common/ExitIntentPopup'

const UserLayout = () => {
  return (
    <>
      <Header/>
      <main>
        <Outlet/>
      </main>
      <Footer/>
      <ScrollToTopButton/>
      <WhatsAppWidget />
      <ExitIntentPopup />
    </>
  )
}

export default UserLayout
