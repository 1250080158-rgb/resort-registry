import { useEffect, useState } from 'react';
import { Fee as MockFee } from '../../data/mockData';
import { feeApi, Fee as ApiFee } from '../../utils/api';
import { transformFees } from '../../utils/dataTransform';

export default function FeeManagement() {
  const [fees, setFees] = useState<MockFee[]>([]);
  const [rawFees, setRawFees] = useState<ApiFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, { amount: string; enabled: boolean }>>({});
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newFee, setNewFee] = useState({ name: '', type: 'percentage' as 'percentage' | 'fixed', amount: '', enabled: true, description: '', appliesTo: '' });

  const loadFees = async () => {
    try {
      const data = await feeApi.getAll();
      setRawFees(data);
      setFees(transformFees(data));
    } catch {
      alert('Không tải được danh sách phí. Kiểm tra backend đã chạy ở cổng 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFees(); }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const startEdit = (fee: MockFee) => {
    setEditingFee(fee.id);
    setTempValues(prev => ({ ...prev, [fee.id]: { amount: String(fee.amount), enabled: fee.enabled } }));
  };

  const saveEdit = async (id: string) => {
    const tmp = tempValues[id];
    if (!tmp) return;
    const raw = rawFees.find(r => r.id === Number(id));
    if (!raw) return;
    try {
      await feeApi.update(raw.id, { ...raw, amount: Number(tmp.amount), enabled: tmp.enabled });
      setEditingFee(null);
      await loadFees();
      showSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật phí thất bại');
    }
  };

  const toggleEnabled = async (id: string) => {
    try {
      await feeApi.toggleEnabled(Number(id));
      await loadFees();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Đổi trạng thái phí thất bại');
    }
  };

  const addFee = async () => {
    if (!newFee.name || !newFee.amount) return;
    try {
      await feeApi.create({
        id: 0,
        name: newFee.name,
        type: newFee.type.toUpperCase() as ApiFee['type'],
        amount: Number(newFee.amount),
        enabled: newFee.enabled,
        description: newFee.description,
        appliesTo: newFee.appliesTo,
      });
      setNewFee({ name: '', type: 'percentage', amount: '', enabled: true, description: '', appliesTo: '' });
      setShowAdd(false);
      await loadFees();
      showSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Thêm phí thất bại');
    }
  };

  const processingFee = fees.find(f => f.name.toLowerCase().includes('xử lý'))?.amount ?? 5;
  const depositFee = fees.find(f => f.name.toLowerCase().includes('cọc'))?.amount ?? 33;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-navy font-semibold">Quản Lý Phí</h2>
          <p className="text-muted text-sm mt-0.5">Định nghĩa và quản lý các loại phí trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-navy text-gold font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-navy-light transition-colors"
        >
          + Thêm Loại Phí
        </button>
      </div>

      {saved && (
        <div className="bg-success/10 border border-success/20 text-success text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
          <span>✓</span> Phí đã được cập nhật thành công!
        </div>
      )}

      {/* Fee cards */}
      <div className="space-y-4">
        {fees.map(fee => (
          <div key={fee.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${fee.enabled ? 'border-cream-dark' : 'border-muted/20 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-navy font-semibold">{fee.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    fee.type === 'percentage' ? 'bg-teal/10 text-teal' : 'bg-navy/5 text-navy'
                  }`}>
                    {fee.type === 'percentage' ? '%' : 'Cố Định'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    fee.enabled ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
                  }`}>
                    {fee.enabled ? 'Đang Áp Dụng' : 'Đã Tắt'}
                  </span>
                </div>
                <p className="text-muted text-sm">{fee.description}</p>
                <p className="text-xs text-muted mt-1">Áp dụng cho: <span className="font-semibold text-navy">{fee.appliesTo}</span></p>
              </div>

              <div className="text-right shrink-0">
                {editingFee === fee.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempValues[fee.id]?.amount || ''}
                      onChange={e => setTempValues(prev => ({ ...prev, [fee.id]: { ...prev[fee.id], amount: e.target.value } }))}
                      className="w-20 px-2 py-1.5 text-sm rounded-lg border border-gold/40 text-navy bg-cream text-right font-mono-data"
                    />
                    <span className="text-muted text-sm">{fee.type === 'percentage' ? '%' : 'tr'}</span>
                    <button onClick={() => saveEdit(fee.id)} className="text-xs bg-navy text-gold px-3 py-1.5 rounded-lg font-semibold hover:bg-navy-light transition-colors">
                      Lưu
                    </button>
                    <button onClick={() => setEditingFee(null)} className="text-xs text-muted hover:text-navy">
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-display text-3xl text-navy font-semibold">{fee.amount}</span>
                      <span className="text-muted text-sm ml-1">{fee.type === 'percentage' ? '%' : 'triệu'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(fee)} className="text-xs text-teal border border-teal/30 px-3 py-1.5 rounded-lg hover:border-navy/30 hover:text-navy transition-all">
                        Sửa
                      </button>
                      <button onClick={() => toggleEnabled(fee.id)} className={`text-xs border px-3 py-1.5 rounded-lg transition-all ${fee.enabled ? 'text-error border-error/30 hover:bg-error/5' : 'text-success border-success/30 hover:bg-success/5'}`}>
                        {fee.enabled ? 'Tắt' : 'Bật'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Policy overview */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
        <h3 className="font-display text-navy font-semibold mb-4">Tổng Quan Chính Sách Phí</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Phí Xử Lý', val: `${processingFee}%`, desc: 'Thu một lần khi đặt chỗ', color: 'bg-gold/10 border-gold/20' },
            { title: 'Đặt Cọc', val: `${depositFee.toFixed(0)}%`, desc: 'Hoàn trả khi hết hợp đồng', color: 'bg-teal/10 border-teal/20' },
            { title: 'Phí Hủy Muộn', val: '50%', desc: 'Áp dụng trong vòng 30 ngày', color: 'bg-error/10 border-error/20' },
          ].map(s => (
            <div key={s.title} className={`rounded-xl p-4 border ${s.color}`}>
              <p className="text-xs text-muted mb-1">{s.title}</p>
              <p className="font-display text-2xl text-navy font-semibold">{s.val}</p>
              <p className="text-xs text-muted mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example calculation */}
      <div className="bg-navy rounded-2xl p-5 text-cream">
        <h3 className="font-display font-semibold mb-4">Ví Dụ Tính Phí</h3>
        <div className="bg-navy-lighter rounded-xl p-4 text-sm space-y-2">
          <p className="text-cream/60 text-xs mb-3">Thuê villa 3 tháng, giá 85 triệu/tháng</p>
          <div className="flex justify-between"><span className="text-cream/70">Tiền thuê (85 × 3)</span><span className="font-mono-data text-cream">255.0 tr</span></div>
          <div className="flex justify-between"><span className="text-cream/70">Phí xử lý (5%)</span><span className="font-mono-data text-cream">12.75 tr</span></div>
          <div className="flex justify-between"><span className="text-cream/70">Đặt cọc (1 tháng)</span><span className="font-mono-data text-cream">85.0 tr</span></div>
          <hr className="border-navy-lighter" />
          <div className="flex justify-between font-bold"><span className="text-gold">TỔNG CỘNG</span><span className="font-display text-gold text-lg">352.75 tr</span></div>
        </div>
      </div>

      {/* Add fee modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-navy font-semibold">Thêm Loại Phí Mới</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted hover:text-navy text-2xl">×</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Tên Loại Phí', field: 'name' as const, type: 'text' },
                { label: 'Mô Tả', field: 'description' as const, type: 'text' },
                { label: 'Áp Dụng Cho', field: 'appliesTo' as const, type: 'text' },
                { label: 'Số Tiền', field: 'amount' as const, type: 'number' },
              ].map(f => (
                <div key={f.field}>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={newFee[f.field]}
                    onChange={e => setNewFee(prev => ({ ...prev, [f.field]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-cream-dark text-navy bg-cream"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 block">Loại Phí</label>
                <div className="flex gap-3">
                  {[{ val: 'percentage', label: 'Phần Trăm (%)' }, { val: 'fixed', label: 'Cố Định (triệu)' }].map(t => (
                    <label key={t.val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="feeType" value={t.val} checked={newFee.type === t.val} onChange={() => setNewFee(prev => ({ ...prev, type: t.val as 'percentage' | 'fixed' }))} className="accent-gold" />
                      <span className="text-sm text-navy">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addFee} className="flex-1 py-3 rounded-xl bg-navy text-gold font-semibold text-sm hover:bg-navy-light transition-colors">
                Thêm Loại Phí
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-cream-dark text-navy font-semibold text-sm hover:border-navy/40 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
