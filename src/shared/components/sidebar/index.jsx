import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import Logo from 'assets/images/logo-white.png'
import LogoIcon from 'assets/images/logo-icon.png'
import { Button } from 'react-bootstrap'
import { sidebarConfig } from './SidebarConfig'
import MenuItem from './MenuItem'
import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from '../permission-provider'

function SideBar() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`side-bar ${isOpen && 'expanded'}`}>
      <div className="logo">
        <Link to={allRoutes.dashboard}>
          {isOpen && <img src={Logo} alt="CricTracker" />}
          {!isOpen && <img src={LogoIcon} alt="CricTracker" />}
        </Link>
      </div>
      <div className="menu">
        <ul className="p-0 m-0">
          {sidebarConfig.map((item) => {
            if (item.isAllowedTo) {
              return (
                <PermissionProvider isArray={item.isArray} key={item.path} isAllowedTo={item.isAllowedTo}>
                  <MenuItem item={item} isMenuOpen={isOpen} />
                </PermissionProvider>
              )
            } else {
              return <MenuItem key={item.path} item={item} isMenuOpen={isOpen} />
            }
          })}
        </ul>
      </div>
      <Button onClick={() => setIsOpen(!isOpen)} variant="link" className="open-btn square lh-1 p-1">
        <i className="icon-sidebar"></i>
      </Button>
    </div>
  )
}

export default SideBar
