import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!currentUser || currentUser.email !== 'harimidhudriver@gmail.com') {
    return <Navigate to="/login" />
  }

  return <>{children}</>
} 