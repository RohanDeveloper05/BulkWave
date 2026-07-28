import axios from "axios";

/* ================= BASE CONFIG ================= */

const API_BASE = import.meta.env.VITE_API_URL;

const API = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ================= Recipient Lists ================= */

export const fetchRecipientLists = async () => {
    const res = await API.get("/list-email/");
    return res.data;
};

export const deleteRecipientList = async (id: number) => {
    const res = await API.delete(`/delete-list/${id}/`);
    return res.data;
};

export const uploadRecipientList = async (formData: FormData) => {
    const res = await axios.post(`${API_BASE}/upload-list-email/`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const fetchListEntries = async (
    listId: number,
    page = 1,
    pageSize = 10
) => {
    const res = await API.get(`/view-list-entry/${listId}/`, {
        params: { page, page_size: pageSize },
    });
    return res.data;
};

export const downloadListCSV = async (listId: number) => {
    try {
        const res = await API.get(`/lists/${listId}/download-csv/`, {
            responseType: "blob",
        });

        // ✅ Get filename from backend if exists
        const contentDisposition = res.headers["content-disposition"];
        let fileName = `list_${listId}.csv`;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match?.[1]) fileName = match[1];
        }

        // ✅ Create blob
        const blob = new Blob([res.data], { type: "text/csv" });

        // ✅ Download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        // cleanup
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("CSV Download Error:", error);
    }
};

/* ================= Email Campaign ================= */

export const fetchEmailCampaignRecipients = async (params?: {
    search?: string;
    status?: string[];
    min_emails?: number;
    date_filter?: string;
    start_date?: string;
    end_date?: string;
    ordering?: string;
    page?: number;
    from_email?: string; // ✅ FIX (only type, no value here)
}) => {

    const query = new URLSearchParams();

    // Search
    if (params?.search) {
        query.append("search", params.search);
    }

    // Multi-status
    if (params?.status && params.status.length > 0) {
        query.append("status", params.status.join(","));
    }

    // Min emails
    if (params?.min_emails !== undefined) {
        query.append("min_emails", String(params.min_emails));
    }

    // From email ✅ ADD THIS
    if (params?.from_email) {
        query.append("from_email", params.from_email);
    }

    // Date filter (preset)
    if (params?.date_filter) {
        query.append("date_filter", params.date_filter);
    }

    // Custom date range
    if (params?.start_date && params?.end_date) {
        query.append("start_date", params.start_date);
        query.append("end_date", params.end_date);
    }

    // Sorting
    if (params?.ordering) {
        query.append("ordering", params.ordering);
    }

    // Pagination
    if (params?.page) {
        query.append("page", String(params.page));
    }

    const url = `${API_BASE}/email-recipients?${query.toString()}`;

    const res = await axios.get(url);
    return res.data;
};

/* ================= Attachments APIs ================= */

export const createAttachment = async (data: FormData) => {
    const res = await axios.post(`${API_BASE}/attachments-create/`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const updateAttachment = async (id: number, data: FormData) => {
    const res = await axios.put(`${API_BASE}/attachments-update/${id}/`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const listAttachments = async () => {
    const res = await API.get("/attachments-list/");
    return res.data;
};

export const deleteAttachment = async (id: number) => {
    const res = await API.delete(`/attachments-delete/${id}/`);
    return res.data;
};

export interface AttachmentNamesResponse {
    attachment_names: string[];
}

export const fetchAttachmentNames = async (): Promise<string[]> => {
    const res = await API.get("/attachments-name/");
    return res.data.attachment_names;
};

/* ================= KPI TRACK ================= */

type KPIParams = {
    filter: string;
    start_date?: string;
    end_date?: string;
};

export const fetchKPIData = async (params: KPIParams) => {
    const res = await API.get("/data/track/", { params });
    return res.data;
};

export const fetch30DaysTrack = async () => {
    const res = await API.get("/data/30daystrack/");
    return res.data;
};

export const fetchAllMergedEmails = async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    subscribers?: string;
    min_lists?: number;
    list_names?: string;
}) => {

    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page.toString());
    if (params.page_size) query.append("page_size", params.page_size.toString());
    if (params.search) query.append("search", params.search);
    if (params.subscribers) query.append("subscribers", params.subscribers);
    if (params.min_lists) query.append("min_lists", params.min_lists.toString());
    if (params.list_names) query.append("list_names", params.list_names);

    const res = await API.get(`/all-list-email/?${query.toString()}`);
    return res.data;
};

/* ================= Templates APIs ================= */

export interface TemplatePayload {
    template_name: string;
    description: string;
    html: string;
    css: string;
    js: string;
    emails: string;
}

// ✅ GET ALL
export const listTemplates = async () => {
    const res = await API.get("/templates-list/");
    return res.data;
};

// ✅ GET SINGLE (EDIT FETCH)
export const getTemplateById = async (id: number | string) => {
    const res = await API.get(`/template-one/${id}/`);
    return res.data;
};

// ✅ CREATE
export const createTemplate = async (data: TemplatePayload) => {
    const res = await API.post("/templates-create/", data);
    return res.data;
};

// ✅ UPDATE (EDIT SAVE)
export const updateTemplate = async (
    id: number | string,
    data: TemplatePayload
) => {
    const res = await API.put(`/template-update/${id}/`, data);
    return res.data;
};

// ✅ DELETE
export const deleteTemplate = async (id: number | string) => {
    const res = await API.delete(`/template-delete/${id}/`);
    return res.data;
};


/* ================= Template Names (Dropdown) ================= */

export interface TemplateName {
    id: number;
    template_name: string;
    html: string;
    css: string;
    js: string;
}

interface TemplateAPIResponse {
    success: boolean;
    message: string;
    count: number;
    data: TemplateName[];
}

export const listTemplateNames = async (
    email?: string
    ): Promise<TemplateAPIResponse> => {
    try {
        const url = email
        ? `/templates-name/?email=${encodeURIComponent(email)}`
        : `/templates-name/`;

        const res = await API.get<TemplateAPIResponse>(url);
        return res.data;
    } catch (error) {
        console.error("Error fetching template names:", error);
        return {
        success: false,
        message: "Failed",
        count: 0,
        data: [],
        };
    }
};


/* ================= SEND EMAIL ================= */

export const sendEmail = async (
    data: FormData | Record<string, any>
    ) => {
    try {
        const isFormData = data instanceof FormData;

        const res = await API.post(
        "/send_email/",
        data,
        isFormData
            ? {
                headers: {
                "Content-Type": "multipart/form-data",
                },
            }
            : {}
        );

        return res.data;
    } catch (error: any) {
        console.error("Error sending email:", error);
        throw error?.response?.data || { error: "Failed to send email" };
    }
};

/// This is For Unsubscribe API

export const unsubscribeEmail = async (data: {
    token: string;
    reason: string;
}) => {
    try {
        const res = await API.post("/unsubscribe-email/", data);

        return res.data;

    } catch (error: any) {
        console.error("Error unsubscribing:", error);

        throw error?.response?.data || {
            error: "Failed to unsubscribe",
        };
    }
};


/// =============================
/// KPI CARD API
/// =============================

interface FetchOneKPIParams {
  type?: string;
  filter?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
}

export const fetchOneKPIData = async ({
  type,
  filter,
  start_date,
  end_date,
  search,
  page = 1,
}: FetchOneKPIParams) => {
  try {
    const params = new URLSearchParams();

    if (type?.trim()) {
      params.append("KPICard", type.trim());
    }

    if (filter?.trim()) {
      params.append("filter", filter.trim());
    }

    if (
      filter === "custom" &&
      start_date?.trim() &&
      end_date?.trim()
    ) {
      params.append("start_date", start_date.trim());
      params.append("end_date", end_date.trim());
    }

    if (search?.trim()) {
      params.append("search", search.trim());
    }

    params.append("page", String(page));

    const apiURL = `/data/kpicard/?${params.toString()}`;

    const response = await API.get(apiURL);

    return response.data;
  } catch (error: any) {
    console.error("❌ KPI API Error:", error);

    throw (
      error?.response?.data || {
        status: "error",
        message: "Failed to fetch KPI data",
      }
    );
  }
};


export const fetchListsByEmail = async (email: string) => {
    try {
        const res = await API.get(`/list-name/`, {
        params: {
            email: email,
        },
        });

        return res.data;
    } catch (err) {
        console.error("Failed to fetch lists", err);
        return null;
    }
};