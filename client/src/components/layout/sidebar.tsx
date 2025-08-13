import { Brain, Home, Upload, Folder, Search, BarChart, User, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">RAG Agent</h1>
            <p className="text-sm text-gray-500">Document Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-white">
              <Home className="text-sm" />
              <span className="font-medium">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Upload className="text-sm" />
              <span className="font-medium">Upload Documents</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Folder className="text-sm" />
              <span className="font-medium">Document Library</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Search className="text-sm" />
              <span className="font-medium">Query Interface</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <BarChart className="text-sm" />
              <span className="font-medium">Analytics</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
