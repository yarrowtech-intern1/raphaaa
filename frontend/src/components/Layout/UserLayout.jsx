import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { Outlet, useLocation } from 'react-router-dom'
import ScrollToTopButton from '../Common/ScrollToTopButton'
import WhatsAppWidget from '../Common/WhatsAppWidget'
import ExitIntentPopup from '../Common/ExitIntentPopup'
import MobileFooterNav from './MobileFooterNav'

const UserLayout = () => {
  const location = useLocation()
  const hideMobileFooterMenu = location.pathname === "/checkout"
  const hideFooterOnMobileRoutes = [
    "/profile",
    "/login",
    "/register",
    "/forgot-password",
  ]
  const hideFooterOnMobile = hideFooterOnMobileRoutes.includes(location.pathname)
  const isHomePage = location.pathname === "/"
  const hideTopbarOnMobile = !isHomePage

  return (
    <>
      <Header hideTopbarOnMobile={hideTopbarOnMobile} />
      <main className="pb-20 lg:pb-0">
        <Outlet/>
      </main>
      <div className={hideFooterOnMobile ? "hidden lg:block" : ""}>
        <Footer/>
      </div>
      {!hideMobileFooterMenu && <MobileFooterNav />}
      <div className="hidden lg:block">
        <ScrollToTopButton/>
      </div>
      <WhatsAppWidget />
      <ExitIntentPopup />
    </>
  )
}

export default UserLayout
