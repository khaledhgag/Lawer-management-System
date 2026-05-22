import toast from 'react-hot-toast';

export default function CopyButton({ text, label = 'نسخ', className = 'btn-ghost text-sm' }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ');
    } catch {
      toast.error('تعذر النسخ');
    }
  };
  return (
    <button type="button" onClick={copy} className={className}>
      {label}
    </button>
  );
}
