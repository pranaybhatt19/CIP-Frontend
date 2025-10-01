import * as Yup from 'yup';
export const LoginvalidationSchema=Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'At least 8 characters')
      .max(32, 'At max 32 characters allowed')
      .required('Password is required'),
  })

  export const ForgotPasswordvalidationSchema=Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required')
 
  })

  export const ResetPasswordValidationSchema = Yup.object({
   
    new_password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must not exceed 32 characters")
      .required("New password is required"),
    
    confirm_password: Yup.string()
      .oneOf([Yup.ref("new_password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });
  export const OTPValidationSchema = Yup.object().shape({
    otp1: Yup.string().required().matches(/^[0-9]$/, "Must be a digit"),
    otp2: Yup.string().required().matches(/^[0-9]$/, "Must be a digit"),
    otp3: Yup.string().required().matches(/^[0-9]$/, "Must be a digit"),
    otp4: Yup.string().required().matches(/^[0-9]$/, "Must be a digit"),
    otp5: Yup.string().required().matches(/^[0-9]$/, "Must be a digit"),
    otp6: Yup.string().required().matches(/^[0-9]$/, "Must be a digit"),
  });