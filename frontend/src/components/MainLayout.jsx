import React from 'react'
import LeftSidebar from './LeftSidebar'
import { Outlet } from 'react-router-dom'
import Home from './Home'
function MainLayout() {
  return (
    <div>

      <LeftSidebar/>
      <div>
        <Outlet/>
      </div>
      
    </div>
  )
}

export default MainLayout
