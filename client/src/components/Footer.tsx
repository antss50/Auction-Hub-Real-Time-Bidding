export default function Footer() {
  return (
    <footer className="bg-[#802623] text-gray-300 text-sm py-8 px-6 mt-12 m-10 rounded-xl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Thanh Cong Auction</h3>
          <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
          <p>Điện thoại: 123456789</p>
          <p>Email: abc@gmail.com</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Liên kết nhanh</h3>
          <ul className="space-y-2">
            {/* <li><a href="/about" className="hover:underline">Giới thiệu</a></li> */}
            <li><a href="/contact" className="hover:underline">Liên hệ</a></li>
            {/* <li><a href="/guide" className="hover:underline">Hướng dẫn</a></li> */}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Bản quyền</h3>
          <p>© {new Date().getFullYear()} Thanh Cong Auction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
