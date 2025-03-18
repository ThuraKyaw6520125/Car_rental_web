"use client"; // ✅ Fixes the event handler issue
//FIX THE FLOATING REPORT
import { notFound } from "next/navigation";


export default function ReportDetail({ params }) {
  const report = reports.find((r) => r.id.toString() === params.id);

  if (!report) return notFound(); // Show 404 if report not found

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md bg-white rounded-2xl shadow-lg p-6">
        <img className="w-full h-48 object-cover rounded-lg" src={report.imageUrl} alt={report.name} />
        <h2 className="text-2xl font-bold mt-4">{report.type}: {report.name}</h2>
        <p className="text-gray-600 mt-2"> Rate: {report.rate}</p>
        <p className="text-gray-600 mt-2"> Description: {report.description}</p>
        <p className={`mt-4 text-lg font-semibold ${report.status === "Resolved" ? "text-green-500" : "text-red-500"}`}>
          Status: {report.status}
        </p>

        <button
          onClick={() => history.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
