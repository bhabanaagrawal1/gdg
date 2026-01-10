import React, { useEffect } from 'react'
import Qsos from '../components/Qsos'

const Sos = () => {
  const { isAuth, authToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

  return (
    <div>
      <Qsos />
    </div>
  )
}

export default Sos
