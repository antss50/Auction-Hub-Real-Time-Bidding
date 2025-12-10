import Link from "next/link";
import Image from "next/image";
import { Article } from "../../types/article";
import { Calendar, FileText, User } from "lucide-react";
import { formatDate, getImageUrl } from "../../app/utils/format";

export const ArticleCard = ({ item }: { item: Article }) => {
  const imageUrl = getImageUrl(item.image);

  return (
    <Link
      href={`/articles/${item.id}`}
      className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden block hover:shadow-md hover:-translate-y-1 transition duration-300 h-full flex flex-col"
    >
      <div className="relative h-40 w-full bg-gray-100">
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-gray-800 mb-2 text-base line-clamp-2 min-h-[3rem]" title={item.title}>
          {item.title}
        </h3>
        
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
           <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded max-w-[50%] truncate" title={item.author}>
              <User className="w-3 h-3 flex-shrink-0" /> 
              <span className="truncate">{item.author}</span>
            </span>
           <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
              <Calendar className="w-3 h-3 flex-shrink-0" /> 
              <span>{formatDate(item.createdAt)}</span>  
           </span>
        </div>
        
        <p className="text-gray-600 text-xs line-clamp-3 mb-3 flex-grow">
          {item.description}
        </p>

        <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mt-auto">
           <FileText className="w-3 h-3" /> Đọc tiếp
        </div>
      </div>
    </Link>
  );
};