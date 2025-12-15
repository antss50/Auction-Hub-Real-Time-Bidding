import Link from "next/link";

export default function Topbar() {
  return (
    <div className="bg-yellow-500 text-black text-base flex justify-between px-6 py-2 sticky top-0 z-50">
      <div className="flex gap-6">
        <span>Contact: 123456789</span>
        <span>abc@gmail.com</span>
      </div>
      <div className="flex gap-6">
        <Link href="/articles">Tin tức</Link>
        <Link href="/about">Giới thiệu</Link>
        <Link href="/contacts">Liên hệ</Link>
        <span>VI | EN</span>
      </div>
    </div>
  );
}
