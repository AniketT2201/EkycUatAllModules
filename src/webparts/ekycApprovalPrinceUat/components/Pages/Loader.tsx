import * as React from 'react';

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
    <p className="text-gray-700 font-semibold text-lg">Loading, please wait...</p>
  </div>
);

export default Loader;
