// import { useEffect, useState } from "react";
// import {
//     Eye,
//     MousePointer,
//     Send,
//     AlertTriangle,
//     Shield
// } from "lucide-react";

// import clsx from "clsx";
// import { useLocation, useNavigate } from "react-router-dom";

// import { fetchOneKPIData } from "../../api/recipients";

// type KPIItem = {
//     recipient: string;
//     event_type: string;
//     source: string | null;
//     subject: string | null;
//     timestamp: string;
// };

// const iconMap: any = {
//     Open: Eye,
//     Click: MousePointer,
//     Send: Send,
//     Failed: AlertTriangle,
//     Spam: Shield
// };

// const colorMap: any = {
//     Open: "purple",
//     Click: "green",
//     Send: "blue",
//     Failed: "red",
//     Spam: "orange"
// };

// export default function KPICard() {

//     const location = useLocation();
//     const navigate = useNavigate();

//     // const scrollRef = useRef<HTMLDivElement | null>(null);

//     // // ✅ FIXED REFS
//     // const pageRef = useRef(1);
//     // const hasNextRef = useRef(false);
//     // const loadingMoreRef = useRef(false);

//     const getTypeFromURL = () => {
//         const params = new URLSearchParams(location.search);
//         return params.get("type") || "Open";
//     };

//     const [type, setType] = useState(getTypeFromURL());

//     const [data, setData] = useState<KPIItem[]>([]);
//     const [count, setCount] = useState(0);

//     const [loading, setLoading] = useState(false);
//     // const [loadingMore, setLoadingMore] = useState(false);

//     // ✅ Pagination
//     const [page, setPage] = useState(1);
//     const [hasNext, setHasNext] = useState(false);
//     const [totalPages, setTotalPages] = useState(1);

//     // ✅ Search
//     const [search, setSearch] = useState("");
//     const [debouncedSearch, setDebouncedSearch] = useState("");

//     // =========================
//     // Sync refs
//     // =========================

//     // useEffect(() => {
//     //     pageRef.current = page;
//     // }, [page]);

//     // useEffect(() => {
//     //     hasNextRef.current = hasNext;
//     // }, [hasNext]);

//     // useEffect(() => {
//     //     loadingMoreRef.current = loadingMore;
//     // }, [loadingMore]);

//     // =========================
//     // Debounce Search
//     // =========================

//     useEffect(() => {

//         const timer = setTimeout(() => {
//             setDebouncedSearch(search);
//         }, 500);

//         return () => clearTimeout(timer);

//     }, [search]);

//     // =========================
//     // Sync URL Type
//     // =========================

//     useEffect(() => {
//         setType(getTypeFromURL());
//     }, [location.search]);

//     // =========================
//     // Fetch KPI Data
//     // =========================

//     // const fetchKPI = async (
//     //     pageNumber = 1,
//     //     append = false
//     // ) => {

//     //     try {

//     //         if (append) {

//     //             if (
//     //                 loadingMoreRef.current ||
//     //                 !hasNextRef.current
//     //             ) {
//     //                 return;
//     //             }

//     //             loadingMoreRef.current = true;
//     //             setLoadingMore(true);

//     //         } else {
//     //             setLoading(true);
//     //         }

//     //         const res = await fetchOneKPIData({
//     //             type,
//     //             search: debouncedSearch,
//     //             page: pageNumber,
//     //         });

//     //         const newData = res.results?.data || [];

//     //         if (append) {
//     //             setData(prev => [...prev, ...newData]);
//     //         } else {
//     //             setData(newData);
//     //         }

//     //         setCount(res.count || 0);

//     //         // ✅ Pagination
//     //         const nextExists = !!res.next;

//     //         setHasNext(nextExists);
//     //         hasNextRef.current = nextExists;

//     //         // ✅ Update next page
//     //         if (nextExists) {

//     //             const nextPage = pageNumber + 1;

//     //             setPage(nextPage);
//     //             pageRef.current = nextPage;
//     //         }

//     //     } catch (err) {

//     //         console.error("KPI Card Error:", err);

//     //     } finally {

//     //         if (append) {

//     //             loadingMoreRef.current = false;
//     //             setLoadingMore(false);

//     //         } else {
//     //             setLoading(false);
//     //         }
//     //     }
//     // };

//     const fetchKPI = async (pageNumber = 1) => {
//         try {
//             setLoading(true);

//             const res = await fetchOneKPIData({
//                 type,
//                 search: debouncedSearch,
//                 page: pageNumber,
//             });

//             setData(res.results?.data || []);
//             setCount(res.count || 0);

//             setHasNext(!!res.next);

//             const PAGE_SIZE = 10;

//             setTotalPages(
//                 Math.max(
//                     1,
//                     Math.ceil((res.count || 0) / PAGE_SIZE)
//                 )
//             );

//         } catch (err) {
//             console.error("KPI Card Error:", err);
//         } finally {
//             setLoading(false);
//         }
//     };


//     // =========================
//     // Reset & Fetch
//     // =========================

//     // useEffect(() => {

//     //     setData([]);

//     //     setPage(1);
//     //     pageRef.current = 1;

//     //     setHasNext(false);
//     //     hasNextRef.current = false;

//     //     fetchKPI(1, false);

//     // }, [type, debouncedSearch]);

//     useEffect(() => {
//         setPage(1);
//     }, [type, debouncedSearch]);

//     useEffect(() => {
//         fetchKPI(page);
//     }, [page, type, debouncedSearch]);


//     // =========================
//     // Infinite Scroll
//     // =========================

//     // useEffect(() => {

//     //     const container = scrollRef.current;

//     //     if (!container) return;

//     //     const handleScroll = () => {

//     //         const nearBottom =
//     //             container.scrollTop + container.clientHeight >=
//     //             container.scrollHeight - 50;

//     //         if (
//     //             nearBottom &&
//     //             hasNextRef.current &&
//     //             !loadingMoreRef.current
//     //         ) {
//     //             fetchKPI(pageRef.current, true);
//     //         }
//     //     };

//     //     container.addEventListener("scroll", handleScroll);

//     //     return () => {
//     //         container.removeEventListener("scroll", handleScroll);
//     //     };

//     // }, []);

//     // =========================
//     // Auto Load If Small Table
//     // =========================

//     // useEffect(() => {

//     //     const container = scrollRef.current;

//     //     if (!container) return;

//     //     if (
//     //         container.scrollHeight <= container.clientHeight &&
//     //         hasNextRef.current &&
//     //         !loadingMoreRef.current
//     //     ) {
//     //         fetchKPI(pageRef.current, true);
//     //     }

//     // }, [data]);

//     const Icon = iconMap[type];

//     return (
//         <div className="space-y-6">

//             {/* Header */}
//             <div className="flex items-center justify-between">

//                 <div>
//                     <h1 className="text-2xl font-bold text-gray-900">
//                         {type} KPI Details
//                     </h1>
//                 </div>

//                 <div className="flex items-center gap-3">

//                     <button
//                         onClick={() => navigate("/")}
//                         className="px-3 py-2 bg-gray-100 rounded-md"
//                     >
//                         ← Dashboard
//                     </button>

//                     <select
//                         value={type}
//                         onChange={(e) => {
//                             navigate(`/kpi?type=${e.target.value}`);
//                         }}
//                         className="border px-4 py-2 rounded-md"
//                     >
//                         <option value="Open">Open</option>
//                         <option value="Click">Click</option>
//                         <option value="Send">Send</option>
//                         <option value="Failed">Failed</option>
//                         <option value="Spam">Spam</option>
//                     </select>

//                 </div>
//             </div>

//             {/* Search */}
//             <div className="bg-white p-3 shadow-sm rounded-md">

//                 <input
//                     type="text"
//                     placeholder="Search..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="w-full border px-3 py-2 rounded-md text-sm outline-none"
//                 />

//             </div>

//             {/* KPI Summary */}
//             <div className="bg-white p-6 shadow-sm flex justify-between">

//                 <div>
//                     <p className="text-sm text-gray-500">
//                         {type} Events
//                     </p>

//                     <h2 className="text-3xl font-bold">
//                         {loading ? "..." : count}
//                     </h2>
//                 </div>

//                 <div
//                     className={clsx(
//                         "h-12 w-12 flex items-center justify-center rounded-lg",
//                         {
//                             "bg-blue-50 text-blue-600":
//                                 colorMap[type] === "blue",

//                             "bg-red-50 text-red-600":
//                                 colorMap[type] === "red",

//                             "bg-orange-50 text-orange-600":
//                                 colorMap[type] === "orange",

//                             "bg-green-50 text-green-600":
//                                 colorMap[type] === "green",

//                             "bg-purple-50 text-purple-600":
//                                 colorMap[type] === "purple"
//                         }
//                     )}
//                 >
//                     <Icon className="h-6 w-6" />
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">

//                 {/* <div
//                     ref={scrollRef}
//                     className="overflow-x-auto overflow-y-auto max-h-[550px] scroll-smooth border border-gray-300 rounded-xl"
//                 > */}
//                 <div className="overflow-x-auto border border-gray-300 rounded-xl">

//                     <table className="min-w-full divide-y divide-gray-200">

//                         {/* Header */}
//                         <thead className="bg-gray-50 sticky top-0 z-10">

//                             <tr>

//                                 <th className="px-6 py-3 text-xs text-gray-500">
//                                     S No.
//                                 </th>

//                                 <th className="px-6 py-3 text-xs text-gray-500">
//                                     Date
//                                 </th>

//                                 <th className="px-6 py-3 text-xs text-gray-500">
//                                     Subject
//                                 </th>

//                                 <th className="px-6 py-3 text-xs text-gray-500">
//                                     Event
//                                 </th>

//                                 <th className="px-6 py-3 text-xs text-gray-500">
//                                     Recipient
//                                 </th>

//                                 <th className="px-6 py-3 text-xs text-gray-500">
//                                     Source
//                                 </th>

//                             </tr>

//                         </thead>

//                         {/* Body */}
//                         <tbody className="divide-y divide-gray-200 bg-white">

//                             {data.map((item, index) => (

//                                 <tr
//                                     key={index}
//                                     className="hover:bg-gray-50"
//                                 >

//                                     <td className="px-6 py-4 text-sm">
//                                         {((page - 1) * 10) + index + 1}
//                                     </td>

//                                     <td className="px-6 py-4 text-sm">
//                                         {new Date(
//                                             item.timestamp
//                                         ).toLocaleDateString()}
//                                     </td>

//                                     <td className="px-6 py-4 text-sm font-medium">
//                                         {item.subject || "-"}
//                                     </td>

//                                     <td className="px-6 py-4">
//                                         <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
//                                             {item.event_type}
//                                         </span>
//                                     </td>

//                                     <td className="px-6 py-4 text-sm truncate">
//                                         {item.recipient}
//                                     </td>

//                                     <td className="px-6 py-4 text-sm">
//                                         {item.source || "-"}
//                                     </td>

//                                 </tr>
//                             ))}

//                             {/* Initial Loading */}
//                             {loading && (
//                                 <tr>
//                                     <td
//                                         colSpan={6}
//                                         className="py-6 text-center"
//                                     >
//                                         Loading...
//                                     </td>
//                                 </tr>
//                             )}

//                             {/* Infinite Loading */}
//                             {/* {loadingMore && (
//                                 <tr>
//                                     <td
//                                         colSpan={6}
//                                         className="py-4 text-center"
//                                     >
//                                         Loading more...
//                                     </td>
//                                 </tr>
//                             )} */}

//                             <div className="flex items-center justify-between px-4 py-4 border-t bg-white">

//                                 <button
//                                     onClick={() => setPage(prev => Math.max(prev - 1, 1))}
//                                     disabled={page === 1}
//                                     className={`px-4 py-2 rounded-md ${
//                                         page === 1
//                                             ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                                             : "bg-blue-600 text-white"
//                                     }`}
//                                 >
//                                     Previous
//                                 </button>

//                                 <div className="text-sm font-medium">
//                                     Page {page} of {totalPages}
//                                 </div>

//                                 <button
//                                     onClick={() => setPage(prev => prev + 1)}
//                                     disabled={!hasNext}
//                                     className={`px-4 py-2 rounded-md ${
//                                         !hasNext
//                                             ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                                             : "bg-blue-600 text-white"
//                                     }`}
//                                 >
//                                     Next
//                                 </button>

//                             </div>

//                             {/* Empty */}
//                             {!loading && data.length === 0 && (
//                                 <tr>
//                                     <td
//                                         colSpan={6}
//                                         className="py-8 text-center text-gray-500"
//                                     >
//                                         No data found
//                                     </td>
//                                 </tr>
//                             )}

//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }