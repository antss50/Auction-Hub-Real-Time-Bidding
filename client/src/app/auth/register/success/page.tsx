"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@auction-hub/shacdn-ui/card";
import { Button } from "@auction-hub/shacdn-ui/button";
import Link from "next/link";
import { Suspense } from "react";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "email của bạn";

  return (
    <Card className="w-full max-w-lg">
      < CardHeader >
        <CardTitle className="text-2xl font-bold text-center">
          Đăng ký thành công
        </CardTitle >
      </CardHeader >
      <CardContent className="space-y-4">
        <p className="text-center">
          Chúng tôi đã gửi liên kết xác thực đến <span className="font-semibold">{email}</span>.
        </p>
        <p className="text-center text-sm text-gray-600">
          Vui lòng kiểm tra hộp thư(và thư mục Spam) để hoàn tất xác thực tài khoản.
        </p >
        <div className="pt-2">
          < Button asChild className="w-full bg-red-800 hover:bg-red-900 text-white">
            < Link href="/auth/login">Đến trang đăng nhập</Link>
          </Button >
        </div >
      </CardContent >
    </Card >
  );
}

export default function RegisterSuccessPage() {
  return (
    // Wrap trong Suspense để tránh lỗi de-opt build trong Next.js
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="text-center">Đang tải...</div>}>
        <RegisterSuccessContent />
      </Suspense>
    </div>
  );
}
