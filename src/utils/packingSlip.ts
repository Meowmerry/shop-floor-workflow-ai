import type { WorkItem, Order } from '../types';
import type { FactoryUser } from '../types/auth';

export function generatePackingSlipHTML(
  item: WorkItem,
  order: Order,
  currentUser: FactoryUser | null
): string {
  const printDate = new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dueDate = order.dueDate 
    ? new Date(order.dueDate).toLocaleDateString() 
    : 'Not specified';

  return `<!DOCTYPE html>
<html>
  <head>
    <title>Packing Slip - ${order.id}</title>
    <style>
      * { margin: 0; padding: 0; }
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 20px;
        background: white;
        color: #000;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        border: 2px solid #000;
        padding: 30px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #000;
        padding-bottom: 20px;
      }
      .header h1 {
        font-size: 28px;
        margin-bottom: 5px;
      }
      .header p {
        font-size: 12px;
        color: #666;
      }
      .date-time {
        text-align: right;
        font-size: 11px;
        margin-bottom: 20px;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        font-size: 14px;
        font-weight: bold;
        background: #f0f0f0;
        padding: 8px 12px;
        margin-bottom: 12px;
        border-left: 4px solid #2563eb;
      }
      .section-content {
        padding-left: 12px;
      }
      .field {
        margin-bottom: 8px;
        font-size: 13px;
      }
      .field-label {
        font-weight: bold;
        color: #333;
        display: inline-block;
        width: 140px;
      }
      .field-value {
        color: #000;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 13px;
      }
      table th {
        background: #e5e7eb;
        border: 1px solid #000;
        padding: 10px;
        text-align: left;
        font-weight: bold;
      }
      table td {
        border: 1px solid #ccc;
        padding: 10px;
      }
      table tr:nth-child(even) {
        background: #f9fafb;
      }
      .barcode {
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
        margin: 5px 0;
        background: #f5f5f5;
        padding: 8px;
        border: 1px solid #ccc;
        text-align: center;
      }
      .notes {
        background: #f9fafb;
        border-left: 3px solid #f59e0b;
        padding: 12px;
        margin-top: 15px;
        font-size: 12px;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 11px;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 15px;
      }
      @media print {
        body { padding: 0; }
        .container { border: none; padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>PACKING SLIP</h1>
        <p>Cyclone Manufacturing - Workflow Control System</p>
      </div>

      <div class="date-time">
        <strong>Printed:</strong> ${printDate}
      </div>

      <div class="section">
        <div class="section-title">ORDER INFORMATION</div>
        <div class="section-content">
          <div class="field">
            <span class="field-label">Order ID:</span>
            <span class="field-value">${item.orderId}</span>
          </div>
          <div class="field">
            <span class="field-label">Order Number:</span>
            <span class="field-value">${order.orderNumber || 'N/A'}</span>
          </div>
          <div class="field">
            <span class="field-label">Item Status:</span>
            <span class="field-value">${item.status}</span>
          </div>
          <div class="field">
            <span class="field-label">Priority:</span>
            <span class="field-value">${item.priority}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">SHIP TO</div>
        <div class="section-content">
          <div class="field">
            <span class="field-label">Customer:</span>
            <span class="field-value">${order.customerName || 'Unknown Customer'}</span>
          </div>
          <div class="field">
            <span class="field-label">Due Date:</span>
            <span class="field-value">${dueDate}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ITEMS TO SHIP</div>
        <table>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${item.id}</strong></td>
              <td>${item.name}<br><span style="font-size: 11px; color: #666;">${item.description || 'No description'}</span></td>
              <td style="text-align: center;"><strong>${item.quantity}</strong></td>
              <td>${item.status}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">BARCODE</div>
        <div class="barcode">${item.id}</div>
        <p style="text-align: center; font-size: 11px; color: #666; margin-top: 5px;">Scan barcode to verify shipment</p>
      </div>

      <div class="notes">
        <strong>Important:</strong> Verify all items match this packing slip before sealing the package. Check order number, quantities, and item descriptions.
      </div>

      <div class="footer">
        <p>Packed by: ${currentUser?.name || 'Operator'} | System: Cyclone Manufacturing WCS</p>
        <p>Do not include this slip in the package. Attach to outside of box.</p>
      </div>
    </div>

    <script>
      window.addEventListener('load', function() {
        window.print();
        setTimeout(function() { window.close(); }, 500);
      });
    </script>
  </body>
</html>`;
}
