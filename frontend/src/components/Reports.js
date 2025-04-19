import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Reports({ userEmail }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get("http://localhost:5000/reports", {
                    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
                });
                setReports(response.data);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Your Medical Reports</h2>
            {loading ? (
                <p>Loading reports...</p>
            ) : reports.length === 0 ? (
                <p>No reports found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Prediction</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report._id}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{report.prediction}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {new Date(report.createdAt).toLocaleString()}
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    <a href={`http://localhost:5007${report.reportPath}`} target="_blank" rel="noopener noreferrer">
                                        View PDF
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Reports;

