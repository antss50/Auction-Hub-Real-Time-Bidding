import Link from "next/link";
import Image from "next/image";
import { AuctionItem } from "../../types/auction";
import { formatCurrency, getImageUrl } from "../../app/utils/format";

export const AuctionCard = ({ item }: { item: AuctionItem }) => {
  // Xử lý ảnh an toàn ngay tại đây
  const imageUrl = getImageUrl(item.image); 

  return (
    <Link
      href={`/auctions/${item.id}`}
      className="bg-yellow-200 shadow-md rounded-lg overflow-hidden block hover:scale-[1.02] transition h-full flex flex-col"
    >
      <div className="relative h-40 w-full bg-yellow-100">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <div className="bg-yellow-400 p-4 flex-grow flex flex-col justify-between">
        <h3 className="font-bold text-gray-800 mb-3 text-base line-clamp-2 min-h-[3rem]" title={item.name}>
          {item.name}
        </h3>
        <div className="space-y-1">
          <p className="flex justify-between text-sm font-light">
            Giá khởi điểm: <span className="font-semibold">{formatCurrency(item.startingPrice)}</span>
          </p>
          <p className="flex justify-between text-sm font-light">
            Tiền đặt trước: <span className="font-semibold">{formatCurrency(item.deposit)}</span>
          </p>
          <p className="flex justify-between text-sm font-light">
            Thời gian: <span className="font-semibold">{item.time}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};