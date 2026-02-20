export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pager">
      <button disabled={page <= 0} onClick={() => onChange(page - 1)}>Prev</button>
      <span>
        {page + 1} / {totalPages}
      </span>
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}
