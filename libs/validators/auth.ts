// src/lib/validators/auth.ts
import * as z from 'zod';

// Definition of Form
export const registerFormSchema = z.object({
  user_type: z.enum(['individual', 'business'], {
    message: "Vui lòng chọn loại người dùng"
  }),

  full_name: z.string().min(1, "Vui lòng nhập họ và tên"),

  email: z.string().email("Email không hợp lệ"),  
  
  phone_number: z.string()
    .min(10, "Số điện thoại phải có 10 số")
    .max(10, "Số điện thoại phải có 10 số")
    .regex(/^0/, "Số điện thoại phải bắt đầu bằng 0"), 

  identity_number: z.string().optional(), 

  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "Phải có ít nhất 1 chữ thường")
    .regex(/[0-9]/, "Phải có ít nhất 1 chữ số"),

  confirmPassword: z.string(), 
  
  tax_id: z.string().optional(), 

  acceptTerms: z.boolean().refine(val => val === true, { 
    message: "Bạn phải đồng ý với Điều khoản và Chính sách bảo mật"
  })
})
.refine(data => {
  // Check if password matches confirmPassword
  return data.password === data.confirmPassword;
}, {
  message: "Xác nhận mật khẩu không khớp",
  path: ["confirmPassword"], 
})
.refine(data => {
  if (data.user_type === 'business') {
   return !!data.tax_id && data.tax_id.length > 0; 
  }
  if (data.user_type === 'individual') {
    return !!data.identity_number && data.identity_number.length === 12; 
  }
  return true;
}, {
  message: "Trường này là bắt buộc và phải đúng định dạng",
  path: ["identity_number", "tax_id"],
});

// Type for FORM 
export type RegisterFormSchema = z.infer<typeof registerFormSchema>;

// Type for API Payload
export type RegisterApiPayload = Omit<RegisterFormSchema, 'confirmPassword' | 'acceptTerms'>;


// Schemas for Login
export const loginSchema = z.object({
  email: z.string().email("Vui lòng nhập email hợp lệ"),
  phone_number: z.string().optional(),
  tax_id: z.string().optional(),
  identity_number: z.string().optional(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginSchema = z.infer<typeof loginSchema>;