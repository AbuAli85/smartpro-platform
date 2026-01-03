import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportData = {
  officeName: string;
  period: string;
  metrics: {
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  bookingTrends: Array<{ month: string; count: number }>;
  popularServices: Array<{ service: string; count: number }>;
  customerFeedback: Array<{
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
};

export function generateOfficeReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header with branding
  doc.setFillColor(30, 64, 175); // Blue color
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SmartPro Business Services", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Office Performance Report", pageWidth / 2, 30, { align: "center" });

  // Reset text color for body
  doc.setTextColor(0, 0, 0);
  yPos = 50;

  // Office Information
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.officeName, 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Report Period: ${data.period}`, 20, yPos);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPos, { align: "right" });
  yPos += 15;

  // Key Metrics Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Key Performance Metrics", 20, yPos);
  yPos += 10;

  // Metrics table
  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: [
      ["Total Bookings", data.metrics.totalBookings.toString()],
      ["Confirmed Bookings", data.metrics.confirmedBookings.toString()],
      ["Completed Bookings", data.metrics.completedBookings.toString()],
      ["Cancelled Bookings", data.metrics.cancelledBookings.toString()],
      ["Total Revenue", `OMR ${data.metrics.totalRevenue.toFixed(2)}`],
      ["Average Rating", `${data.metrics.averageRating.toFixed(1)} / 5.0`],
      ["Total Reviews", data.metrics.totalReviews.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Booking Trends Section
  if (data.bookingTrends.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Trends", 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Month", "Bookings"]],
      body: data.bookingTrends.map((trend) => [trend.month, trend.count.toString()]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Popular Services Section
  if (data.popularServices.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Popular Services", 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Service", "Bookings"]],
      body: data.popularServices.map((service) => [service.service, service.count.toString()]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Customer Feedback Section
  if (data.customerFeedback.length > 0) {
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Recent Customer Feedback", 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [["Customer", "Rating", "Comment", "Date"]],
      body: data.customerFeedback.map((feedback) => [
        feedback.customerName,
        `${feedback.rating}/5`,
        feedback.comment.length > 50 ? feedback.comment.substring(0, 47) + "..." : feedback.comment,
        feedback.date,
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
      columnStyles: {
        2: { cellWidth: 80 }, // Comment column wider
      },
    });
  }

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "SmartPro Business Services - National Digital Infrastructure",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  // Generate filename
  const filename = `${data.officeName.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`;

  // Save the PDF
  doc.save(filename);
}
