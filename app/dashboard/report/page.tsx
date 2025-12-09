"use client";

import { useState } from "react";

// Mock data for the list of reports (dates)
const MOCK_REPORTS = [
  { id: 1, date: "2025-12-09", totalItems: 150, status: "Completed" },
  { id: 2, date: "2025-12-08", totalItems: 124, status: "Completed" },
  { id: 3, date: "2025-12-07", totalItems: 98, status: "Reviewed" },
  { id: 4, date: "2025-12-06", totalItems: 145, status: "Completed" },
  { id: 5, date: "2025-12-05", totalItems: 112, status: "Pending" },
];

// Mock data for a specific report detail
const MOCK_REPORT_DETAIL = [
  { id: "IMG_001", time: "08:30 AM", category: "Ring", count: 12, description: "Gold ring with diamond", image: "/mock-image-1.jpg" },
  { id: "IMG_002", time: "09:15 AM", category: "Necklace", count: 5, description: "Silver chain necklace", image: "/mock-image-2.jpg" },
  { id: "IMG_003", time: "10:45 AM", category: "Earrings", count: 8, description: "Pearl earrings", image: "/mock-image-3.jpg" },
  { id: "IMG_004", time: "11:20 AM", category: "Bracelet", count: 3, description: "Gold bracelet", image: "/mock-image-4.jpg" },
  { id: "IMG_005", time: "02:10 PM", category: "Ring", count: 15, description: "Wedding bands", image: "/mock-image-5.jpg" },
];

export default function ReportPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleBack = () => {
    setSelectedReport(null);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-sea-sub-blue rounded-lg shadow-xl border border-sea-gold/20 min-h-[600px]">
        
        {/* Header Section */}
        <div className="p-6 border-b border-sea-blue flex justify-between items-center">
          <h2 className="text-xl font-semibold text-sea-gold">
            {selectedReport ? `Report: ${selectedReport}` : "Daily Reports"}
          </h2>
          {selectedReport && (
            <button 
              onClick={handleBack}
              className="px-3 py-1.5 text-sm bg-sea-blue text-sea-light-gray rounded hover:bg-sea-blue/80 transition-colors border border-sea-gray/30"
            >
              ← Back to List
            </button>
          )}
        </div>

        <div className="p-6">
          {!selectedReport ? (
            /* List View */
            <div className="overflow-x-auto rounded-lg border border-sea-blue">
              <table className="min-w-full divide-y divide-sea-blue">
                <thead className="bg-sea-blue">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider">Total Items</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-sea-gold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-sea-sub-blue divide-y divide-sea-blue">
                  {MOCK_REPORTS.map((report) => (
                    <tr 
                      key={report.id} 
                      className="hover:bg-sea-blue/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedReport(report.date)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{report.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-sea-light-gray">{report.totalItems}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${report.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-sea-gold hover:text-yellow-400">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Detail View (Excel-like Table) */
            <div>
              <div className="overflow-x-auto border border-sea-blue rounded-lg">
                <table className="min-w-full divide-y divide-sea-blue">
                  <thead className="bg-sea-blue">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider w-24">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider w-32">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider w-32">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sea-gold uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-sea-gold uppercase tracking-wider w-24">Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-sea-sub-blue divide-y divide-sea-blue">
                    {MOCK_REPORT_DETAIL.map((item, index) => (
                      <tr key={index} className="hover:bg-sea-blue/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sea-light-gray">{item.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sea-light-gray">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-sea-light-gray">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-bold">{item.count}</td>
                      </tr>
                    ))}
                    {/* Summary Row */}
                    <tr className="bg-sea-blue/50 font-bold">
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-right text-sea-gold">Total:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-sea-gold">43</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <button className="bg-sea-gold hover:bg-yellow-500 text-sea-blue font-bold py-2 px-4 rounded inline-flex items-center transition-colors shadow-lg">
                  <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
