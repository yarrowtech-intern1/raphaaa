import React from 'react'
import Topbar from '../Layout/Topbar'
import Navbar from './Navbar'

const Header = ({ hideTopbarOnMobile = false }) => {
  return (
    <header className="">
      <div className={hideTopbarOnMobile ? "hidden lg:block" : ""}>
        <Topbar/>
      </div>
      <Navbar/>
    </header>
  )
}

export default Header
