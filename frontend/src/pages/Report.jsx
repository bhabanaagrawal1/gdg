import React, { useEffect } from 'react'
import Reports from '../components/Reports'
import Navbar from '../components/Navbar'


const Report = () => {
  const { isAuth, authToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  return (
    <div>
      <Navbar />
      <Reports />
    </div>
  )
}

export default Report
