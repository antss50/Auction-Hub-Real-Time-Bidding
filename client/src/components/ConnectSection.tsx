"use client";
import { Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import { useToast } from '@auction-hub/shacdn-ui/hooks/use-toast';

export default function ConnectSection() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({ title: 'Cảm ơn', description: 'Cảm ơn bạn đã đăng ký nhận thông tin!' });
        e.currentTarget.reset();
    };

    return (
        <section className="bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto bg-[#7A2320] rounded-3xl text-center text-white py-12 px-6 shadow-md">
                <h2 className="text-2xl font-bold mb-2">Kết nối với chúng tôi</h2>
                <p className="text-sm text-gray-200 mb-8">
                    Để nắm thông tin kịp thời và hỗ trợ nhanh nhất
                </p>

                {/* Social icons */}
                <div className="flex justify-center gap-6 mb-8 flex-wrap">
                    <a
                        href="https://facebook.com"
                        target="_blank"
                        className="flex flex-col items-center hover:opacity-80 transition"
                    >
                        <div className="w-10 h-10 bg-white text-[#1877f2] rounded-full flex items-center justify-center">
                            <Facebook size={22} />
                        </div>
                        <span className="text-xs mt-1">Facebook</span>
                    </a>
                    <a
                        href="https://youtube.com"
                        target="_blank"
                        className="flex flex-col items-center hover:opacity-80 transition"
                    >
                        <div className="w-10 h-10 bg-white text-[#FF0000] rounded-full flex items-center justify-center">
                            <Youtube size={22} />
                        </div>
                        <span className="text-xs mt-1">YouTube</span>
                    </a>
                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        className="flex flex-col items-center hover:opacity-80 transition"
                    >
                        <div className="w-10 h-10 bg-white text-[#0A66C2] rounded-full flex items-center justify-center">
                            <Linkedin size={22} />
                        </div>
                        <span className="text-xs mt-1">LinkedIn</span>
                    </a>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        className="flex flex-col items-center hover:opacity-80 transition"
                    >
                        <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center">
                            <Twitter size={22} />
                        </div>
                        <span className="text-xs mt-1">Twitter</span>
                    </a>
                    <a
                        href="https://zalo.me"
                        target="_blank"
                        className="flex flex-col items-center hover:opacity-80 transition"
                    >
                        <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center">
                            <Image
                                src="/images/zalo-icon.png"
                                alt="Zalo"
                                width={22}
                                height={22}
                            />
                        </div>
                        <span className="text-xs mt-1">Zalo</span>
                    </a>
                </div>

                {/* Email subscription form */}
                <section className="bg-[#7A2320] py-8">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto"
                    >
                        {/* Ô nhập email */}
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            className="flex-1 px-4 py-2 rounded-full bg-white text-gray-800 focus:outline-none shadow-sm"
                        />

                        {/* Nút gửi */}
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white bg-white text-[#7A2320] font-medium text-base hover:bg-gray-100 transition shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                            Kết nối với chúng tôi
                        </button>
                    </form>
                </section>
            </div>
        </section>
    );
}
