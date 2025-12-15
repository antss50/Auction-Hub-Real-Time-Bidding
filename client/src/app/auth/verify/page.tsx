"use client";

import { useEffect, useState, Suspense } from "react"; // Thêm Suspense
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@auction-hub/shacdn-ui/hooks/use-toast";
import apiClient from "axios"; // Import axios instance của bạn
import { Card, CardContent, CardHeader, CardTitle } from "@auction-hub/shacdn-ui/card";
import { Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyUser = async () => {
      // Supabase trả về 'code' trong URL khi redirect
      const code = searchParams.get("code");

      if (!code) {
        setStatus("error");
        return;
      }

      try {
        // Gọi API Backend để verify code này (Bạn cần implement API này ở backend nếu chưa có)
        // Hoặc nếu dùng Supabase client ở frontend:
        // await supabase.auth.exchangeCodeForSession(code)

        // GIẢ SỬ: Bạn gọi Backend để verify (Backend gọi supabase.auth.exchangeCodeForSession)
        // Lưu ý: Code backend hiện tại của bạn đang dùng 'token', cần check lại logic Supabase PKCE

        // Nếu backend chưa có route exchange code, bạn có thể xử lý tạm ở frontend bằng supabase-js
        // Nhưng tốt nhất là gọi API backend:
        await apiClient.post('/auth/verify-email', { token: code }); // Giả sử backend nhận 'token' là code

        setStatus("success");
        toast({ title: "Xác thực thành công!", className: "bg-green-500 text-white" });

        // Chuyển hướng về trang login sau 2 giây
        setTimeout(() => router.push("/auth/login"), 2000);

      } catch (error) {
        console.error(error);
        setStatus("error");
        toast({
          title: "Xác thực thất bại",
          description: "Link đã hết hạn hoặc không hợp lệ.",
          variant: "destructive"
        });
      }
    };

    verifyUser();
  }, [searchParams, router, toast]);

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-center">Xác thực tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p>Đang xác thực email của bạn...</p>
          </>
        )}
        {status === "success" && (
          <div className="text-center text-green-600">
            <p className="text-lg font-bold">Thành công!</p>
            <p>Đang chuyển hướng đến trang đăng nhập...</p>
          </div>
        )}
        {status === "error" && (
          <div className="text-center text-red-600">
            <p className="text-lg font-bold">Lỗi!</p>
            <p>Không thể xác thực. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}