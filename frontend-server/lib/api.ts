// 1) 배포 대비: 환경변수 우선
const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8084/api/bookmarklet';

const API_IMPROVE_URL =
    process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8084/api/bookmarklet/improve';

export interface ComplaintRequest {
    system: string;
    title: string;
    content: string;
    phone: string;
    email: string;
    isPublic: string;
    smsNotification: string;
}

export interface BookmarkletResponse {
    success: boolean;
    message: string;
    templateId: string;
    bookmarkletUrl: string;
    bookmarkletCode: string;
}

// (신규) 원샷 엔드포인트
export async function createBookmarklet(
    data: ComplaintRequest
): Promise<BookmarkletResponse> {
    const res = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

export async function improveComplaint(id: number): Promise<BookmarkletResponse> {
    const res = await fetch(`${API_IMPROVE_URL}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

// (기존) 구형 경로: 필요시 호환 유지
export async function generateBookmarklet(
    data: ComplaintRequest
): Promise<BookmarkletResponse> {
    const res = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

export async function getComplaints() {
    const res = await fetch(`${API_BASE_URL}/complaints`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}