// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, RegisterFormSchema } from "@auction-hub/validators/auth";
import { registerUser } from "../../../services/authService";
import { useRouter } from "next/navigation";
import { useToast } from "@auction-hub/shacdn-ui/hooks/use-toast";
import { Button } from "@auction-hub/shacdn-ui/button";
import { Input } from "@auction-hub/shacdn-ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@auction-hub/shacdn-ui/form";
import { Checkbox } from "@auction-hub/shacdn-ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@auction-hub/shacdn-ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@auction-hub/shacdn-ui/card";
import { Eye, EyeOff, User, Building } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      user_type: "individual", 
      phone_number: "",
      identity_number: "",
      tax_id: "",
      confirmPassword: "",
      acceptTerms: false, 
    },
  });

  // Follow user_type to render UI dynamically
  const userType = form.watch("user_type");

  // Update onSubmit function
  async function onSubmit(data: RegisterFormSchema) {
    // Separate attributes used only in UI (confirmPassword, acceptTerms) from the data sent to the API
    const { confirmPassword, acceptTerms, ...rest  } = data;
    const apiData: any = {
      email: rest.email,
      password: rest.password,
      full_name: rest.full_name,
      phone_number: rest.phone_number,
      user_type: rest.user_type,
      identity_number: rest.user_type === "individual" ? rest.identity_number : rest.tax_id,
    };

    if (rest.user_type === "individual") {
      apiData.identity_number = rest.identity_number;
    }
    if (rest.user_type === "business") {
      apiData.tax_id = rest.tax_id;
    }
    try {
      const res = await registerUser(apiData);
      toast({ title: "Đăng ký thành công!", description: "Vui lòng kiểm tra email để xác thực tài khoản." });
      const email =
        (res?.data as any)?.data?.email || data.email || "";
      router.push(`/auth/register/success?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      if (error.response?.status === 400) {
        form.setError("email", { message: "Email này đã tồn tại" });
      } else {
        toast({
          title: "Lỗi đăng ký",
          description: error.response?.data?.message || "Đã có lỗi xảy ra.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Đăng ký tài khoản
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="individual">
                          <User className="mr-2 h-4 w-4" /> Cá nhân
                        </TabsTrigger>
                        <TabsTrigger value="business">
                          <Building className="mr-2 h-4 w-4" /> Tổ chức
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {userType === "individual" ? "Họ và tên" : "Tên tổ chức"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        userType === "individual"
                          ? "Nhập họ và tên"
                          : "Nhập tên tổ chức"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập thông tin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập thông tin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userType === "individual" ? (
              <FormField
                control={form.control}
                name="identity_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số CMT/CCCD/ Hộ chiếu</FormLabel>
                    <FormControl>
                      <Input placeholder="vd: 123456789012" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã số thuế" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="********"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Link to login page */}
            <p className="text-sm text-center text-gray-600">
              Đã có tài khoản?{" "}
              <a
                href="/auth/login"
                className="text-blue-600 hover:underline"
              >
                Đăng nhập ngay
              </a>
            </p>

            <Button
              type="submit"
              className="w-full bg-red-800 hover:bg-red-900" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}