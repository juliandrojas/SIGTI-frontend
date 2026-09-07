import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <>
    <h1 className="text-center">Public Layout</h1>
    <Outlet />
    </>
  )
}
