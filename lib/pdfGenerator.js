import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotationPDF = (quotationData, products) => {
  const doc = new jsPDF();
  
  // Header with company branding
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.text('WALL CATALOG', 105, 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('QUOTATION', 105, 32, { align: 'center' });
  
  // Horizontal line
  doc.setDrawColor(200);
  doc.line(20, 38, 190, 38);
  
  // Quotation details
  doc.setFontSize(10);
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Date: ${today}`, 20, 48);
  doc.text(`Quotation ID: ${quotationData.id ? quotationData.id.substring(0, 8).toUpperCase() : 'DRAFT'}`, 20, 55);
  
  // Customer details section
  if (quotationData.customer_name || quotationData.customer_email || quotationData.customer_phone) {
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Customer Details:', 20, 68);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    let yPos = 75;
    
    if (quotationData.customer_name) {
      doc.text(`Name: ${quotationData.customer_name}`, 20, yPos);
      yPos += 7;
    }
    if (quotationData.customer_email) {
      doc.text(`Email: ${quotationData.customer_email}`, 20, yPos);
      yPos += 7;
    }
    if (quotationData.customer_phone) {
      doc.text(`Phone: ${quotationData.customer_phone}`, 20, yPos);
      yPos += 7;
    }
  }
  
  // Products table
  const tableData = products.map((product, index) => [
    index + 1,
    product.name,
    product.sku,
    product.finish_type,
    product.room_type,
    product.dimensions || 'N/A',
    `₹${parseFloat(product.price_per_sqft).toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 95,
    head: [['#', 'Product Name', 'SKU', 'Finish', 'Room', 'Dimensions', 'Price/sq.ft']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Summary section
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(`Total Items: ${products.length}`, 20, finalY);
  
  const total = products.reduce((sum, p) => sum + parseFloat(p.price_per_sqft), 0);
  
  // Total box
  doc.setFillColor(239, 246, 255);
  doc.rect(120, finalY - 8, 70, 15, 'F');
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text(`Total: ₹${total.toFixed(2)}/sq.ft`, 125, finalY);
  
  // Notes section
  if (quotationData.notes) {
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text('Notes:', 20, finalY + 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    const splitNotes = doc.splitTextToSize(quotationData.notes, 170);
    doc.text(splitNotes, 20, finalY + 22);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setDrawColor(200);
  doc.line(20, footerY, 190, footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Note: Final pricing may vary based on actual area and installation requirements.', 105, footerY + 7, { align: 'center' });
  doc.text('This is a computer-generated quotation and does not require a signature.', 105, footerY + 12, { align: 'center' });
  doc.text('Thank you for choosing Wall Catalog!', 105, footerY + 17, { align: 'center' });
  
  // Save the PDF
  const fileName = `quotation-${quotationData.id ? quotationData.id.substring(0, 8) : Date.now()}.pdf`;
  doc.save(fileName);
  
  return fileName;
};