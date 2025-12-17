"use client";
import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
    MapPin,
    Phone,
    Home,
    Mail,
    Globe,
    Clock,
    Send,
} from "lucide-react";
import ConnectSection from "../../components/ConnectSection";

interface Office {
    title: string;
    address: string;
}

interface WorkingHours {
    weekdays: string;
    saturday: string;
    sunday: string;
}

interface Banner {
    title: string;
    subtitle: string;
    imageUrl: string;
}

interface ContactData {
    offices: Office[];
    phone: string;
    hotline: string;
    email: string;
    website: string;
    workingHours: WorkingHours;
    support24h: string;
    banner: Banner;
    mapEmbedUrl: string;
}

export default function ContactPage() {
    const [contact, setContact] = useState<ContactData | null>(null);

    useEffect(() => {
        fetch("/mockData.json", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => setContact(data.contactPage))
            .catch((err) => console.error("Failed to load mockData.json", err));
    }, []);

    if (!contact)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Đang tải thông tin liên hệ...
            </div>
        );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert("Cảm ơn bạn! Thông tin đã được gửi thành công.");
        e.currentTarget.reset();
    };

    return (
        <>
            <Topbar />
            <Navbar />

            {/* Banner */}
            <section
                className="relative h-[320px] flex items-center justify-center text-white"
                style={{
                    backgroundImage: `url(${contact.banner.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-bold mb-2">{contact.banner.title}</h1>
                    <p className="text-lg">{contact.banner.subtitle}</p>
                </div>
            </section>

            {/* Thông tin liên hệ */}
            <section className="bg-gray-50 py-12 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Địa chỉ văn phòng */}
                    <div className="bg-white shadow-md rounded-2xl p-6 text-center">
                        <div className="flex justify-center mb-3 text-red-600">
                            <MapPin size={40} />
                        </div>
                        <h2 className="text-lg font-semibold text-red-700 mb-4">
                            Địa chỉ văn phòng
                        </h2>
                        <ul className="text-gray-700 text-sm space-y-2">
                            {contact.offices.map((office, idx) => (
                                <li key={idx}>
                                    <strong>{office.title}:</strong> {office.address}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Thông tin liên lạc */}
                    <div className="bg-white shadow-md rounded-2xl p-6 text-center">
                        <div className="flex justify-center mb-3 text-red-600">
                            <Phone size={40} />
                        </div>
                        <h2 className="text-lg font-semibold text-red-700 mb-4">
                            Thông tin liên lạc
                        </h2>
                        <div className="text-gray-700 text-sm space-y-2">
                            <p>
                                <Phone className="inline w-4 h-4 mr-1" />
                                Điện thoại: {contact.phone}
                            </p>
                            <p>
                                <Phone className="inline w-4 h-4 mr-1" />
                                Hotline: {contact.hotline}
                            </p>
                            <p>
                                <Mail className="inline w-4 h-4 mr-1" />
                                Email:{" "}
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {contact.email}
                                </a>
                            </p>
                            <p>
                                <Globe className="inline w-4 h-4 mr-1" />
                                Website:{" "}
                                <a
                                    href={contact.website}
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                >
                                    {contact.website}
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Giờ làm việc */}
                    <div className="bg-white shadow-md rounded-2xl p-6 text-center">
                        <div className="flex justify-center mb-3 text-red-600">
                            <Home size={40} />
                        </div>
                        <h2 className="text-lg font-semibold text-red-700 mb-4">
                            Giờ làm việc
                        </h2>
                        <div className="text-gray-700 text-sm space-y-2">
                            <p>
                                <Clock className="inline w-4 h-4 mr-1" />
                                {contact.workingHours.weekdays}
                            </p>
                            <p>
                                <Clock className="inline w-4 h-4 mr-1" />
                                {contact.workingHours.saturday}
                            </p>
                            <p>
                                <Clock className="inline w-4 h-4 mr-1" />
                                {contact.workingHours.sunday}
                            </p>
                            <div className="mt-3 border-t pt-2">
                                <p className="text-gray-600">Hỗ trợ 24/7</p>
                                <p className="font-semibold text-red-700">
                                    Hotline: {contact.support24h}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Google Map */}
                <div className="rounded-2xl overflow-hidden shadow-md">
                    <iframe
                        src={contact.mapEmbedUrl}
                        width="100%"
                        height="470"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>

                {/* Form liên hệ */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                        Gửi tin nhắn cho chúng tôi
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-red-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-red-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-red-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nội dung
                            </label>
                            <textarea
                                rows={4}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-red-200"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 w-full bg-[#802623] text-white py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            <Send size={16} />
                            Gửi liên hệ
                        </button>
                    </form>
                </div>
            </section>
            <ConnectSection />
            <Footer />
        </>
    );
}
