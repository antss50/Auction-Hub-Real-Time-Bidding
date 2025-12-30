"use client";
import { useState, useEffect } from "react";
import { Slider } from "@auction-hub/shacdn-ui/slider";
import { Label } from "@auction-hub/shacdn-ui/label";
import { RadioGroup, RadioGroupItem } from "@auction-hub/shacdn-ui/radio-group";
import { Button } from "@auction-hub/shacdn-ui/button";

export type FilterOptions = {
  type: "now" | "upcoming" | "completed" | "all"; // Cho phép "all"
  priceRange: number[];
  category: string;
};

type AuctionFilterProps = {
  onFilterChange: (filters: FilterOptions) => void;
  currentType: "now" | "upcoming" | "completed" | "all"; // Nhận cả "all"
  currentCategory: string;
};

export default function AuctionFilter({
  onFilterChange,
  currentType,
  currentCategory,
}: AuctionFilterProps) {
  // Mặc định là "all" nếu không có gì
  const [selectedType, setSelectedType] = useState<"now" | "upcoming" | "completed" | "all">(currentType || "all");
  const [priceRange, setPriceRange] = useState([0, 10000000000]);
  const [category, setCategory] = useState(currentCategory);

  useEffect(() => {
    setSelectedType(currentType || "all");
    setCategory(currentCategory);
  }, [currentType, currentCategory]);

  const handleSearch = () => {
    onFilterChange({
      type: selectedType,
      priceRange: priceRange,
      category: category,
    });
  };

  const handleReset = () => {
    setSelectedType("all"); // Reset về All
    setPriceRange([0, 10000000000]);
    setCategory("");

    onFilterChange({
      type: "all",
      priceRange: [0, 10000000000],
      category: "",
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100 mt-4 animate-in fade-in slide-in-from-top-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Cột 1: Loại tài sản (Backend Enum) */}
        <div>
          <Label className="mb-3 block font-semibold text-lg">Loại tài sản</Label>
          <RadioGroup
            value={category || "all"}
            onValueChange={(val) => setCategory(val === "all" ? "" : val)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer font-normal">Tất cả</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="secured_asset" id="secured_asset" />
              <Label htmlFor="secured_asset" className="cursor-pointer font-normal">Tài sản đảm bảo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="land_use_rights" id="land_use_rights" />
              <Label htmlFor="land_use_rights" className="cursor-pointer font-normal">Quyền sử dụng đất</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="administrative_violation_asset" id="administrative_violation_asset" />
              <Label htmlFor="administrative_violation_asset" className="cursor-pointer font-normal">TS vi phạm hành chính</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="state_asset" id="state_asset" />
              <Label htmlFor="state_asset" className="cursor-pointer font-normal">Tài sản nhà nước</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enforcement_asset" id="enforcement_asset" />
              <Label htmlFor="enforcement_asset" className="cursor-pointer font-normal">Tài sản thi hành án</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other_asset" id="other_asset" />
              <Label htmlFor="other_asset" className="cursor-pointer font-normal">Tài sản khác</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Cột 2: Thời gian đấu giá (Trạng thái) */}
        <div>
          <Label className="mb-3 block font-semibold text-lg">Trạng thái</Label>
          <RadioGroup
            value={selectedType}
            onValueChange={(val) => setSelectedType(val as any)}
            className="flex flex-col space-y-2"
          >
            {/* THÊM MỤC TẤT CẢ */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status_all" />
              <Label htmlFor="status_all" className="cursor-pointer font-normal">Tất cả</Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now" className="cursor-pointer font-normal">Đang diễn ra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upcoming" id="upcoming" />
              <Label htmlFor="upcoming" className="cursor-pointer font-normal">Sắp diễn ra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="cursor-pointer font-normal">Đã kết thúc</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Cột 3: Khoảng giá & Action */}
        <div className="flex flex-col justify-between">
          <div>
            <Label className="mb-3 block font-semibold text-lg">Khoảng giá khởi điểm</Label>
            <Slider
              defaultValue={[0, 10000000000]}
              max={10000000000}
              step={1000000}
              min={0}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
            <div className="flex justify-between text-sm mt-2 text-gray-600 font-medium">
              <span>{priceRange[0].toLocaleString("vi-VN")} đ</span>
              <span>{priceRange[1].toLocaleString("vi-VN")} đ</span>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              className="flex-1 bg-[#8B1E1E] hover:bg-[#a02424] text-white font-bold"
              onClick={handleSearch}
            >
              Áp dụng
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-gray-300"
            >
              Đặt lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}