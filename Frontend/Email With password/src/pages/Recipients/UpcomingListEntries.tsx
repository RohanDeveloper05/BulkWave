import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Edit3, Check, X } from 'lucide-react';
// import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { fetchListEntries } from '../../api/recipients';
import "../../styles/UpcomingListEntries.css"

export default function UpcomingListEntries() {
  const { id } = useParams<{ id: string }>();

  const [rows, setRows] = useState<any[]>([]);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(15); // ✅ PAGE LIMIT = 20
  const [totalPages, setTotalPages] = useState(1);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH API ---------------- */
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetchListEntries(Number(id), page, pageSize)
      .then(res => {
        setRows(res.results || []);
        setListName(res.list.name);
        setListDescription(res.list.description);
        setTotalPages(res.pagination.total_pages);
      })
      .finally(() => setLoading(false));
  }, [id, page, pageSize]);

  /* ---------------- DYNAMIC COLUMNS ---------------- */
  const columns = useMemo(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]).filter(key => key !== 'id');
  }, [rows]);

  /* ---------------- EDIT HANDLER ---------------- */
  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    setRows(prev => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [key]: value };
      return copy;
    });
  };

  const handleConfirm = () => {
    console.log('UPDATED ROWS:', rows);
    // TODO: CALL BULK UPDATE API HERE
    setIsEditing(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="UpcomingListEntries-page space-y-6">

    {/* Breadcrumb */}
    <div className="flex items-center gap-2 text-sm">
      <Link to="/recipients" className="text-gray-500 hover:text-blue-600">
        Recipients
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400" />

      <Link
        to="/recipients"
        state={{ tab: "lists" }}   // 🔥 THIS IS THE KEY
        className="text-gray-500 hover:text-blue-600"
      >
        Lists
      </Link>

      <ChevronRight className="h-4 w-4 text-gray-400" />

      <span className="List-breadcrumb">
        {listName || "Loading..."}
      </span>
    </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="List-title">{listName}</h1>
          <p className="mt-2 text-gray-600">{listDescription}</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Edit3 className="h-4 w-4" />
            Edit Table
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              <Check className="h-4 w-4" />
              Confirm
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="recipient-table-card">

        <div
          className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[600px] scroll-smooth"
        >

          <table className="recipient-table">

            <thead>

              <tr>

                <th>S No.</th>

                {columns.map((col) => (
                  <th key={col}>
                    {col.replace(/_/g, " ")}
                  </th>
                ))}

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="recipient-loading"
                  >
                    Loading records...
                  </td>
                </tr>

              ) : rows.length === 0 ? (

                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="recipient-loading"
                  >
                    No records found
                  </td>
                </tr>

              ) : (

                rows.map((row, rowIndex) => {

                  const serialNo =
                    (page - 1) * pageSize + rowIndex + 1;

                  return (

                    <tr key={rowIndex}>

                      {/* Serial Number */}
                      <td>
                        {serialNo}
                      </td>

                      {columns.map((col) => (

                        <td key={col}>

                          {isEditing ? (

                            <input
                              value={row[col] ?? ""}
                              onChange={(e) =>
                                handleCellChange(
                                  rowIndex,
                                  col,
                                  e.target.value
                                )
                              }
                              className="recipient-input"
                            />

                          ) : (

                            <div className="recipient-primary">
                              {row[col] ?? "-"}
                            </div>

                          )}

                        </td>

                      ))}

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}

        <div className="recipient-pagination">

          <span className="recipient-page-info">
            Page {page} of {totalPages}
          </span>

          <div className="recipient-pagination-actions">

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="recipient-page-btn"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="recipient-page-btn"
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
