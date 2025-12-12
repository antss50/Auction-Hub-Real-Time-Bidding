"use client";

import { useState } from "react";

type Owner = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
};

type Attachment = {
    url: string;
    type: 'document' | 'video';
};

export default function AuctionTabs({
    description,
    owner,
    attachments,
}: {
    description: string;
    owner: Owner;
    attachments: Attachment[];
}) {
    const [activeTab, setActiveTab] = useState("details");

    const documents = attachments.filter(a => a.type === 'document');
    const videos = attachments.filter(a => a.type === 'video');


    return (
        <div className="min-h-[300px]">
            {/* Tabs header */}
            <div className="flex space-x-8 text-sm font-medium border-b">
                {[
                    { id: "details", label: "Thông tin chi tiết" },
                    { id: "file", label: "Hồ sơ mời đấu giá" },
                    { id: "invalid", label: "Danh sách KH không đủ điều kiện" },
                    { id: "org", label: "Đơn vị tổ chức" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 transition-colors ${activeTab === tab.id
                            ? "border-b-2 border-red-600 text-red-600"
                            : "text-gray-500 hover:text-red-600"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Nội dung tab */}
            <div className="p-6 text-gray-800 leading-relaxed">
                {activeTab === "details" && (
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: markdownToHTML(description || "Chưa có mô tả."),
                        }}
                    />
                )}

                {/* Tab Hồ sơ mời đấu giá */}
                {activeTab === "file" && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Hồ sơ mời đấu giá</h3>

                        {documents.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-700 mb-2">Tài liệu (Documents)</h4>
                                <ul className="space-y-2">
                                    {documents.map((doc, index) => (
                                        <li key={index}>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline transition"
                                            >
                                                Tải về Tài liệu #{index + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {videos.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Video (Video Tour)</h4>
                                <ul className="space-y-2">
                                    {videos.map((vid, index) => (
                                        <li key={index}>
                                            <a
                                                href={vid.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline transition"
                                            >
                                                Xem Video Tour #{index + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {documents.length === 0 && videos.length === 0 && (
                            <p>Chưa có hồ sơ đính kèm.</p>
                        )}
                    </div>
                )}

                {activeTab === "invalid" && (
                    <p>Danh sách khách hàng không đủ điều kiện sẽ hiển thị ở đây.</p>
                )}

                {/* Tab Đơn vị tổ chức */}
                {activeTab === "org" && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Thông tin đơn vị tổ chức</h3>
                        <div className="border border-gray-200 p-4 rounded-lg">
                            <p className="text-gray-600 mb-1">Họ tên:</p>
                            <p className="font-bold text-gray-800 mb-3">{owner.fullName}</p>

                            <p className="text-gray-600 mb-1">Email:</p>
                            <p className="font-bold text-gray-800 mb-3">{owner.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* Markdown to HTML helper */
function markdownToHTML(md: string) {
    return md.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}