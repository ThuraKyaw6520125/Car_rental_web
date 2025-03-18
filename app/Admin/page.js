"use client"; // Needed for state and interactivity

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/reportCard";

const reportedItems = [
  { id: 1, type: "Customer", name: "Doe Doe", reason: "Fraudulent activity", reportedBy: "Jane Smith", details: "Used fake payment methods.", imageUrl: "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg", status: "Pending" },
  { id: 2, type: "Car", name: "Tesla Model S", reason: "Damaged vehicle", reportedBy: "Michael Johnson", details: "Car was delivered with broken mirrors.", imageUrl: "https://media.istockphoto.com/id/1133431051/vector/car-line-icon-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=E9t9aitIGYdX-cggrORFCY1dZR-Y8ff37MbXXLDrv9I=", status: "Pending" },
  { id: 3, type: "Owner", name: "David Miller", reason: "Scamming customers", reportedBy: "Sarah Lee", details: "Owner charged extra fees outside the platform.", imageUrl: "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg", status: "Resolved" },
  { id: 4, type: "Customer", name: "Emily White", reason: "Fake reviews", reportedBy: "John Doe", details: "Customer repeatedly left false reviews.", imageUrl: "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg", status: "Pending" },
];

export default function Admin() {
  const [filter, setFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);

  // Filter reports based on the selected type
  const filteredReports = filter === "All" ? reportedItems : reportedItems.filter((item) => item.type === filter);

  return (
    <div className="bg-purple-800 text-white min-h-screen flex flex-col">
      <Navbar />

      {/* Welcome Section */}
      <section className="flex-grow text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Admin</h1>
      </section>

      {/* Filter Section */}
      <section className="bg-gray-900 py-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Filter Reports by Type</h2>
          <div className="flex justify-center space-x-4">
            {["Customer", "Car", "Owner","All"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg ${
                  filter === type ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
                } text-white transition duration-300`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reported List Section */}
      <section className="bg-gray-900 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">Reported List</h2>

          {/* No reports message */}
          {filteredReports.length === 0 ? (
            <p className="text-gray-400">No reports found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((item) => (
                <Card
                  key={item.id}
                  title={`${item.type}: ${item.name}`}
                  description={`Reason: ${item.reason}`}
                  ownername={`Reported by: ${item.reportedBy}`}
                  imageUrl={item.imageUrl}
                  buttonText="View Report"
                  onClick={() => setSelectedReport(item)} // Open modal with report details
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full relative">
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <img className="w-full h-48 object-cover rounded-lg" src={selectedReport.imageUrl} alt={selectedReport.name} />
            <h2 className="text-2xl font-bold mt-4 text-gray-800">{selectedReport.type}: {selectedReport.name}</h2>
            <p className="text-gray-600 mt-2">🚨 Reason: {selectedReport.reason}</p>
            <p className="text-gray-600 mt-2">📌 Reported By: {selectedReport.reportedBy}</p>
            <p className="text-gray-600 mt-2">📝 Details: {selectedReport.details}</p>
            <p className={`mt-4 text-lg font-semibold ${selectedReport.status === "Resolved" ? "text-green-500" : "text-red-500"}`}>
              Status: {selectedReport.status}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-6 text-center text-sm">
        <p>&copy; 2025 Rent Co. All rights reserved.</p>
      </footer>
    </div>
  );
}


