import { AuctionItem } from "../types/auction";
import { Article } from "../types/article";
import { AuctionCard } from "./cards/AuctionCard";
import { ArticleCard } from "./cards/ArticleCard";

type SectionGridProps = {
  items: (AuctionItem | Article)[];
};

// Type Guard
function isAuctionItem(item: AuctionItem | Article): item is AuctionItem {
  return (item as AuctionItem).startingPrice !== undefined;
}

const SectionGrid = ({ items }: SectionGridProps) => {
  return (
    <section className="my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
        {items.map((item) => {
          // Logic chọn component hiển thị
          if (isAuctionItem(item)) {
            return <AuctionCard key={item.id} item={item} />;
          }
          return <ArticleCard key={item.id} item={item} />;
        })}
      </div>
    </section>
  );
};

export default SectionGrid;