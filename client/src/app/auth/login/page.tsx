// src/app/auth/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "../../../../../libs/validators/auth";
import { loginUser } from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../../libs/shacdn-ui/src/hooks/use-toast";
import { useState } from "react";
import { Button } from "../../../../../libs/shacdn-ui/src/button";
import { Input } from "../../../../../libs/shacdn-ui/src/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../libs/shacdn-ui/src/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../libs/shacdn-ui/src/card";
import { set } from "zod";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize Form
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  async function onSubmit(data: LoginSchema) {
    setLoading(true);
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      // Get user and token from returned data
      const loginData = response.data || response;
      const { user, access_token } = (response.data as any);


      if (!access_token || !user) {
        throw new Error("Phản hồi từ server không hợp lệ");
      }
      // Call login function from context
      auth.login(user, access_token);

      toast({ title: "Đăng nhập thành công!" });
      router.push("/");

    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.response?.status === 401) {
        toast({
          title: "Chưa xác thực email",
          description: "Vui lòng kiểm tra email để xác thực tài khoản.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Sai email hoặc mật khẩu. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Đăng nhập
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end -mt-3">
              <a
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>


            <p className="text-sm text-center text-gray-600">
              Chưa có tài khoản?{" "}
              <a
                href="/auth/register"
                className="text-blue-600 hover:underline"
              >
                Đăng ký ngay
              </a>
            </p>

            <Button
              type="submit"
              className="w-full bg-red-800 hover:bg-red-900"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}