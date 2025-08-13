import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { QueryInterface } from "@/components/dashboard/query-interface";
import { RecentQueries } from "@/components/dashboard/recent-queries";
import { DocumentLibrary } from "@/components/dashboard/document-library";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Document Intelligence Dashboard</h2>
              <p className="text-gray-600">Upload, process, and query your documents with AI</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button className="bg-primary hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Query
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DocumentUpload />
            <QueryInterface />
          </div>

          <RecentQueries />
          <DocumentLibrary />
        </main>
      </div>
    </div>
  );
}
