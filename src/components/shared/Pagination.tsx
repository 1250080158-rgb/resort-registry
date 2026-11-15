interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Thanh phân trang dùng chung cho các bảng admin (hiện tối đa 5 số trang quanh trang hiện tại). */
export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages: number[] = [];
  for (let p = start; p <= Math.min(start + 4, totalPages); p++) pages.push(p);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-cream-dark bg-cream/30">
      <p className="text-xs text-muted">
        Trang <span className="font-semibold text-navy">{page}</span> / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-cream-dark text-navy hover:border-navy/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 py-1.5 text-xs rounded-lg border transition-colors ${
              p === page ? 'bg-navy text-gold border-navy font-semibold' : 'border-cream-dark text-navy hover:border-navy/30'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs rounded-lg border border-cream-dark text-navy hover:border-navy/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
