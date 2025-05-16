import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="h-screen bg-cover bg-center flex items-center justify-center flex-col">
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-black mb-8">404</h1>
        <h2 className="text-3xl text-blue-gray-800 mb-4">No Page Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <button className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition">
            Back to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
