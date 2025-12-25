"use client";

import { useState, useEffect } from "react";
import { Slider } from "@auction-hub/shacdn-ui/slider";
import { Label } from "@auction-hub/shacdn-ui/label";
import { RadioGroup, RadioGroupItem } from "@auction-hub/shacdn-ui/radio-group";
import { Input } from "@auction-hub/shacdn-ui/input"; // 1. Import Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@auction-hub/shacdn-ui/select";
import { Button } from "@auction-hub/shacdn-ui/button";

export type FilterOptions = {
  type: "now" | "upcoming" | "completed";
  priceRange: number[];
  name: string;
  location: string;
  category: string;
};

type AuctionFilterProps = {
  onFilterChange: (filters: FilterOptions) => void;
  currentType: "now" | "upcoming" | "completed";
};

export default function AuctionFilter({ onFilterChange, currentType }: AuctionFilterProps) {
  const [selectedType, setSelectedType] = useState<"now" | "upcoming" | "completed">(currentType);
  const [priceRange, setPriceRange] = useState([0, 10000000000]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    setSelectedType(currentType);
  }, [currentType]);

  const handleSearch = () => {
    onFilterChange({
      type: selectedType,
      priceRange: priceRange,
      name: name,
      location: location,
      category: category,
    });
  };

  const handleReset = () => {
    setSelectedType(currentType);
    setPriceRange([0, 10000000000]);
    setName("");
    setLocation("");
    setCategory("");

    onFilterChange({
      type: currentType,
      priceRange: [0, 10000000000],
      name: "",
      location: "",
      category: "",
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg px-6 md:px-20 py-10 mb-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Bộ lọc tài sản</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* CỘT 1: TÌM KIẾM TÊN & ĐỊA ĐIỂM (Gộp chung để tiết kiệm không gian) */}
        <div className="flex flex-col gap-6">
          {/* 2. Thêm Input tìm kiếm tên */}
          <div>
            <Label className="mb-3 block font-semibold">Tên tài sản</Label>
            <Input
              placeholder="Nhập tên tài sản..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white"
            />
          </div>

          {/* Di chuyển phần Địa điểm vào đây */}
          <div>
            <Label className="mb-3 block font-semibold">Địa điểm</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CỘT 2: KHOẢNG GIÁ */}
        <div>
          <Label className="mb-3 block font-semibold">Khoảng giá</Label>
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

        {/* CỘT 3: THỜI GIAN ĐẤU GIÁ */}
        <div>
          <Label className="mb-3 block font-semibold">Thời gian đấu giá</Label>
          <RadioGroup
            value={selectedType}
            onValueChange={(val) => setSelectedType(val as "now" | "upcoming" | "completed")}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now" className="cursor-pointer">Đang diễn ra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upcoming" id="upcoming" />
              <Label htmlFor="upcoming" className="cursor-pointer">Sắp diễn ra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="cursor-pointer">Đã kết thúc</Label>
            </div>
          </RadioGroup>
        </div>

        {/* CỘT 4: LOẠI TÀI SẢN */}
        <div>
          <Label className="mb-3 block font-semibold">Loại tài sản</Label>
          <RadioGroup
            value={category || "all"}
            onValueChange={(val) => setCategory(val === "all" ? "" : val)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">Tất cả</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="secured_asset" id="secured_asset" />
              <Label htmlFor="secured_asset" className="cursor-pointer">Tài sản đảm bảo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="land_use_rights" id="land_use_rights" />
              <Label htmlFor="land_use_rights" className="cursor-pointer">Quyền sử dụng nhà & đất</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="administrative_violation_asset" id="administrative_violation_asset" />
              <Label htmlFor="administrative_violation_asset" className="cursor-pointer">Tài sản vi phạm hành chính</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="state_asset" id="state_asset" />
              <Label htmlFor="state_asset" className="cursor-pointer">Tài sản nhà nước</Label>
            </div>
             <div className="flex items-center space-x-2">
              <RadioGroupItem value="enforcement_asset" id="enforcement_asset" />
              <Label htmlFor="enforcement_asset" className="cursor-pointer">Tài sản thi hành án</Label>
            </div>
             <div className="flex items-center space-x-2">
              <RadioGroupItem value="other_asset" id="other_asset" />
              <Label htmlFor="other_asset" className="cursor-pointer">Tài sản khác</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
        <Button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8"
          onClick={handleSearch}
        >
          Tìm kiếm
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="px-8 border-gray-300"
        >
          Đặt lại
        </Button>
      </div>
    </div>
  );
}