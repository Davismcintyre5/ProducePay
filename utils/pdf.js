import PDFDocument from 'pdfkit';

function formatKes(amount) {
  return Number(amount).toLocaleString('en-KE');
}

export function generateReceiptPdf({
  receiptNo,
  farmerName,
  farmerCode,
  phone,
  weightKg,
  ratePerKg,
  totalKes,
  collectedAt,
  paidAt,
  method,
  reference,
  organisation,
  footerNote
}) {
  const orgName = organisation?.orgName || 'MOIBEN Maize Produce Collection & Marketing';
  const shortName = organisation?.shortName || 'MOIBEN MMP';
  const orgPhone = organisation?.phone || '';
  const orgEmail = organisation?.email || '';
  const note = footerNote || 'Thank you for your delivery.';

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A5', margin: 40 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).fillColor('#1b5e20').text('ProducePay', { align: 'center' });
      doc.fontSize(9).fillColor('#666').text(orgName, { align: 'center' });
      doc.fontSize(8).fillColor('#999').text('Official Receipt', { align: 'center' });
      doc.moveDown(1);

      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.5);

      doc.fillColor('#000').fontSize(10);
      doc
        .text(`Receipt No: ${receiptNo}`, { continued: true })
        .text(`Date: ${new Date(paidAt || collectedAt).toLocaleString('en-KE')}`, {
          align: 'right'
        });
      doc.moveDown(0.5);

      doc.fontSize(11).fillColor('#1b5e20').text('Farmer');
      doc.fillColor('#000').fontSize(10);
      doc.text(`${farmerName} (${farmerCode})`);
      if (phone) doc.text(phone);
      doc.moveDown(0.5);

      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc
        .text(`Weight Delivered: ${weightKg} kg`, { continued: true })
        .text(`Rate: KES ${formatKes(ratePerKg)}/kg`, { align: 'right' });
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor('#1b5e20').text(`Total: KES ${formatKes(totalKes)}`);
      doc.fillColor('#000').fontSize(10);
      doc.moveDown(0.5);

      if (paidAt) {
        doc
          .text(`Status: PAID via ${method || 'N/A'}`, { continued: true })
          .text(reference ? `Ref: ${reference}` : '', { align: 'right' });
      } else {
        doc.text('Status: PENDING');
      }

      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.5);

      doc.fontSize(8).fillColor('#888').text(note, { align: 'center' });

      const contactLine = [orgPhone, orgEmail].filter(Boolean).join(' · ');
      if (contactLine) {
        doc.moveDown(0.3);
        doc.fontSize(7).fillColor('#aaa').text(contactLine, { align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}