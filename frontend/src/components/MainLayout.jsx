import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import CreatePost from './CreatePost'
import LeftSidebar from './LeftSidebar'
import MobileNav from './MobileNav'

function MainLayout() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop/Tablet Sidebar */}
      <LeftSidebar />
      
      {/* Main Content Area */}
      <main className="md:ml-20 lg:ml-64 min-h-screen pb-20 md:pb-0 transition-all duration-300">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav onCreateClick={() => setCreateOpen(true)} />
      
      {/* Create Post Modal (triggered from mobile nav) */}
      <CreatePost open={createOpen} setOpen={setCreateOpen} />
    </div>
  )
}

export default MainLayout
