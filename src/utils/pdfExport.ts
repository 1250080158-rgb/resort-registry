import { jsPDF } from 'jspdf';
// html2canvas-pro: fork hỗ trợ đầy đủ màu oklch/lab mà Tailwind v4 dùng trong computed styles
import html2canvas from 'html2canvas-pro';

/**
 * Xuất PDF thật bằng jsPDF + html2canvas:
 * render HTML (tiếng Việt an toàn vì được rasterize qua canvas) → trang A4.
 */

// Dữ liệu chung cho biên nhận đặt chỗ (user) và báo cáo admin
export interface PdfBooking {
  id: string | number;
  createdAt: string;
  propertyName: string;
  resort: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  startDate: string;
  endDate: string;
  months: number;
  basePrice: number;
  processingFee: number;
  deposit: number;
  totalPrice: number;
  statusLabel: string;
  paymentLabel: string;
  paymentMethod?: string;
  notes?: string;
}

const NAVY = '#0D1F35';
const GOLD = '#C9A96E';
const MUTED = '#6B7589';

/** Vẽ 1 khối dòng "nhãn ... giá trị" trong biên nhận */
const rowsBlock = (heading: string, rows: Array<[string, string]>) => `
  <div style="margin-top:14px;">
    <div style="font-size:10px;letter-spacing:2px;color:${MUTED};font-weight:bold;margin-bottom:6px;">${heading}</div>
    <div style="border:1px solid #EDE9E0;border-radius:8px;overflow:hidden;">
      ${rows.map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid #F3F0E9;font-size:12px;">
          <span style="color:${MUTED};">${k}</span>
          <span style="color:${NAVY};font-weight:600;">${v}</span>
        </div>`).join('')}
    </div>
  </div>`;

/** Khung HTML chung của biên nhận */
const receiptShell = (docTitle: string, codeLine: string, body: string) => `
  <div style="width:640px;background:#ffffff;font-family:Arial,'Segoe UI',sans-serif;padding:28px 30px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid ${GOLD};padding-bottom:12px;">
      <div>
        <div style="font-size:20px;font-weight:bold;color:${NAVY};">Resort<span style="color:${GOLD};">Registry</span></div>
        <div style="font-size:11px;color:${MUTED};margin-top:2px;">${docTitle}</div>
      </div>
      <div style="font-size:11px;color:${MUTED};text-align:right;">Xuất ngày<br/><b style="color:${NAVY};">${new Date().toLocaleDateString('vi-VN')}</b></div>
    </div>
    <div style="margin-top:12px;font-size:13px;color:${NAVY};">${codeLine}</div>
    ${body}
    <div style="margin-top:20px;padding-top:10px;border-top:1px solid #EDE9E0;font-size:10px;color:${MUTED};text-align:center;">
      Cảm ơn quý khách đã sử dụng ResortRegistry · Hotline 1800 8888 · support@resortregistry.vn
    </div>
  </div>`;

/** Biên nhận đặt chỗ cho khách (trang Lịch Sử Đặt Chỗ) */
export function bookingReceiptHtml(b: PdfBooking): string {
  const body = `
    ${rowsBlock('THÔNG TIN TÀI SẢN', [
      ['Tên tài sản', b.propertyName],
      ['Khu nghỉ dưỡng', b.resort],
    ])}
    ${rowsBlock('THỜI GIAN', [
      ['Bắt đầu', b.startDate],
      ['Kết thúc', b.endDate],
      ['Thời hạn', `${b.months} tháng`],
    ])}
    ${rowsBlock('CHI PHÍ (triệu VNĐ)', [
      ['Tiền thuê', b.basePrice.toFixed(2)],
      ['Phí xử lý', b.processingFee.toFixed(2)],
      ['Đặt cọc', b.deposit.toFixed(2)],
      ['TỔNG CỘNG', b.totalPrice.toFixed(2)],
    ])}
    ${rowsBlock('TRẠNG THÁI', [
      ['Đặt chỗ', b.statusLabel],
      ['Thanh toán', b.paymentLabel],
    ])}`;
  return receiptShell(
    'Biên Lai Đặt Chỗ',
    `Mã đặt chỗ: <b>#${b.id}</b> · Ngày tạo: ${b.createdAt}`,
    body,
  );
}

/** Báo cáo chi tiết đặt chỗ cho admin (thêm thông tin người đặt + ghi chú) */
export function bookingReportHtml(b: PdfBooking): string {
  const body = `
    ${rowsBlock('NGƯỜI ĐĂNG KÝ', [
      ['Họ tên', b.userName || '---'],
      ['Email', b.userEmail || '---'],
      ['Số điện thoại', b.userPhone || '---'],
    ])}
    ${rowsBlock('TÀI SẢN', [
      ['Tên tài sản', b.propertyName],
      ['Khu nghỉ dưỡng', b.resort],
    ])}
    ${rowsBlock('THỜI GIAN', [
      ['Bắt đầu', b.startDate],
      ['Kết thúc', b.endDate],
      ['Thời hạn', `${b.months} tháng`],
    ])}
    ${rowsBlock('CHI PHÍ (triệu VNĐ)', [
      ['Tiền thuê', b.basePrice.toFixed(2)],
      ['Phí xử lý', b.processingFee.toFixed(2)],
      ['Đặt cọc', b.deposit.toFixed(2)],
      ['TỔNG CỘNG', b.totalPrice.toFixed(2)],
    ])}
    ${rowsBlock('TRẠNG THÁI', [
      ['Đặt chỗ', b.statusLabel],
      ['Thanh toán', b.paymentLabel],
      ['Phương thức', b.paymentMethod || '---'],
      ...(b.notes ? ([['Ghi chú', b.notes]] as Array<[string, string]>) : []),
    ])}`;
  return receiptShell(
    'Báo Cáo Đặt Chỗ (Admin)',
    `Mã đặt chỗ: <b>#${b.id}</b> · Ngày tạo: ${b.createdAt}`,
    body,
  );
}

/**
 * Render chuỗi HTML ngoài màn hình rồi lưu thành file PDF A4.
 * Ném lỗi nếu html2canvas thất bại — caller hiển thị thông báo.
 */
export async function exportHtmlToPdf(html: string, filename: string): Promise<void> {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-10000px;top:0;background:#ffffff;';
  container.innerHTML = html;
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 12;
    const maxW = 210 - margin * 2;
    const maxH = 297 - margin * 2;
    let drawW = maxW;
    let drawH = (canvas.height / canvas.width) * drawW;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = (canvas.width / canvas.height) * drawH;
    }
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin + (maxW - drawW) / 2, margin, drawW, drawH);
    pdf.save(filename);
  } finally {
    container.remove();
  }
}
