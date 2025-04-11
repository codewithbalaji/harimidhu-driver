import { Link } from 'react-router-dom'
import TabBar from '../components/TabBar'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-16 md:pb-0">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go back home
        </Link>
      </div>
      <TabBar />
    </div>
  )
}

export default NotFound