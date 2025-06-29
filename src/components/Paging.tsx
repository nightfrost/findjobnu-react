import React from "react";

interface PagingProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number, window: number = 2) {
  const pages: (number | string)[] = [];
  if (total <= 10) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  let start = Math.max(2, current - window);
  let end = Math.min(total - 1, current + window);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

const Paging: React.FC<PagingProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          «
        </button>
        {getPageNumbers(currentPage, totalPages).map((page, idx) =>
          page === "..." ? (
            <button key={idx} className="join-item btn btn-sm btn-disabled">
              ...
            </button>
          ) : (
            <button
              key={page}
              className={`join-item btn btn-sm${currentPage === page ? " btn-active" : ""}`}
              onClick={() => onPageChange(Number(page))}
            >
              {page}
            </button>
          )
        )}
        <button
          className="join-item btn btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Paging;