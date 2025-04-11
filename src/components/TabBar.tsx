import { Link, useLocation } from 'react-router-dom'

const TabBar = () => {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:static md:border-t-0">
      <div className="flex justify-around items-center h-16 md:justify-start md:space-x-8 md:px-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname === '/' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-xs mt-1">Orders</span>
        </Link>

        <Link
          to="/map"
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname === '/map' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs mt-1">Map</span>
        </Link>
      </div>
    </nav>
  )
}

export default TabBar