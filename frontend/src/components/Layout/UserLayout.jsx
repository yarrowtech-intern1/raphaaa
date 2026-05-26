import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ScrollToTopButton from '../Common/ScrollToTopButton'
import WhatsAppWidget from '../Common/WhatsAppWidget'
import ExitIntentPopup from '../Common/ExitIntentPopup'
import MobileFooterNav from './MobileFooterNav'
import { fetchCart } from '../../redux/slices/cartSlice'

const UserLayout = () => {
  const dispatch = useDispatch()
  const { user, guestId } = useSelector((state) => state.auth)
  const location = useLocation()
  const isOrderDetailsPage = /^\/order\/[^/]+$/.test(location.pathname)
  const isCheckoutPage = location.pathname === "/checkout"
  const hideMobileFooterMenu = isCheckoutPage
  const hideFooterOnMobileRoutes = [
    "/profile",
    "/login",
    "/register",
    "/forgot-password",
    "/checkout",
  ]
  const hideFooterOnMobile = hideFooterOnMobileRoutes.includes(location.pathname) || isOrderDetailsPage
  const isHomePage = location.pathname === "/"
  const hideTopbarOnMobile = !isHomePage

  React.useEffect(() => {
    if (user?._id) {
      dispatch(fetchCart({ userId: user._id }))
      return
    }
    if (guestId) {
      dispatch(fetchCart({ guestId }))
    }
  }, [dispatch, user?._id, guestId])

  return (
    <>
      <div className={isCheckoutPage ? "hidden lg:block" : ""}>
        <Header hideTopbarOnMobile={hideTopbarOnMobile} />
      </div>
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
