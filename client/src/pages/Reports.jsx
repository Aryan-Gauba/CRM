// client/src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './Dashboard.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports/summary');
        setReportData(response.data);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError(err.response?.data?.error || 'Access denied or server error while loading reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // PDF Export Function
  const exportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('CRM Executive Performance Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    const summaryData = [
      ['Total Leads', reportData.summary.totalLeads],
      ['Won Deals', reportData.summary.wonLeads],
      ['Lost Deals', reportData.summary.lostLeads],
      ['Conversion Rate', reportData.summary.conversionRate],
      ['Total Revenue', `$${reportData.summary.totalRevenue.toLocaleString()}`]
    ];

    autoTable(doc, {
      startY: 36,
      head: [['Metric', 'Value']],
      body: summaryData,
    });

    const pipelineRows = reportData.pipelineBreakdown.map(item => [
      item.status,
      item.count,
      `$${parseFloat(item.total_value).toLocaleString()}`
    ]);

    doc.text('Pipeline Breakdown Stage-by-Stage', 14, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Stage', 'Count', 'Total Value']],
      body: pipelineRows,
    });

    doc.save('CRM_Report.pdf');
  };

  // Excel Export Function
  const exportExcel = () => {
    if (!reportData) return;
    const summarySheet = XLSX.utils.json_to_sheet([reportData.summary]);
    const pipelineSheet = XLSX.utils.json_to_sheet(reportData.pipelineBreakdown);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');
    XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'Pipeline Breakdown');

    XLSX.writeFile(workbook, 'CRM_Performance_Data.xlsx');
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-color)' }}>Generating analytics...</div>;

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="page-header">
          <h1>Analytics & Reports</h1>
        </div>
        <div className="error-message" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="primary-btn" style={{ background: '#28a745' }} onClick={exportExcel}>
            📊 Export Excel
          </button>
          <button className="primary-btn" style={{ background: '#dc3545' }} onClick={exportPDF}>
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Lead Conversion Rate</h3>
          <p className="metric-value">{reportData?.summary?.conversionRate || '0%'}</p>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#28a745' }}>
          <h3>Won Revenue</h3>
          <p className="metric-value">${(reportData?.summary?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#17a2b8' }}>
          <h3>Total Pipeline Count</h3>
          <p className="metric-value">{reportData?.summary?.totalLeads || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;