'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import {
  registerUser,
  registerSeller,
  CommonRegistrationFormData, // Import the common type
  SellerRegistrationFormData, // Import the seller-specific type
} from "@/services/auth";
import { useAuth } from "@/context/auth-context"; // Import useAuth hook

// To display error messages
const FieldError = ({ message }: { message?: string }) =>
  message ? <p style={{ color: 'red', fontSize: '0.875rem' }}>{message}</p> : null;

// Type for the combined form data, making seller-specific fields optional initially
type CombinedFormData = CommonRegistrationFormData & Partial<Omit<
  SellerRegistrationFormData,
  keyof CommonRegistrationFormData
>>;

// Type for the combined form errors
type CombinedFormErrors = FormErrors & {
  store_name?: string;
  business_email?: string;
  phone_number?: string;
  business_address?: string;
  tax_id?: string;
  userType?: string; // Error for user type selection
};

type FormErrors = {
  username?: string;
  email?: string;
  password1?: string;
  password2?: string;
};


export default function RegisterForm() {
  const router = useRouter();
  const { loginSuccess } = useAuth(); // Get loginSuccess from AuthContext

  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer'); // State for user type selection

  const [formData, setFormData] = useState<CombinedFormData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
    seller_profile: {
      store_name: '',
      business_email: '',
      phone_number: '',
      business_address: '',
      tax_id: ''
    },
  });

  const [errors, setErrors] = useState<CombinedFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle change for all input fields
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear specific field error
    setSubmitError(null); // Clear general submission error on input change
    setIsSuccess(false); // Reset success state on input change
  }

  // Handle change for user type radio buttons
  function handleUserTypeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserType(e.target.value as 'buyer' | 'seller');
    // Clear any seller-specific errors if switching back to buyer
    if (e.target.value === 'buyer') {
      setErrors(prev => {
        const { store_name, business_email, phone_number, business_address, tax_id, ...rest } = prev;
        return rest;
      });
      // Optionally clear seller specific data when switching back to buyer
      setFormData(prev => ({
        ...prev,
        store_name: '',
        business_email: '',
        phone_number: '',
        business_address: '',
        tax_id: ''
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setIsSuccess(false);

    // Common Validation
    const { username, email, password1, password2 } = formData;
    const newErrors: CombinedFormErrors = {};

    if (!username.trim()) newErrors.username = 'Username is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    if (!password1) newErrors.password1 = 'Password is required.';
    if (!password2) newErrors.password2 = 'Confirm your password.';
    else if (password1 !== password2) newErrors.password2 = 'Passwords do not match.';

    // Seller-specific Validation
    if (userType === 'seller') {
      if (!formData.store_name?.trim()) newErrors.store_name = 'Store name is required.';
      if (!formData.business_email?.trim()) newErrors.business_email = 'Business email is required.';
      if (!formData.phone_number?.trim()) newErrors.phone_number = 'Phone number is required.';
      if (!formData.business_address?.trim()) newErrors.business_address = 'Business address is required.';
      // tax_id is optional, so no validation here unless it becomes required
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      let registeredUser;
      if (userType === 'buyer') {
        // Cast formData to CommonRegistrationFormData as we've validated common fields
        registeredUser = await registerUser(formData as CommonRegistrationFormData);
      } else {
        // === CRITICAL CHANGE FOR SELLER REGISTRATION ===
        const {
          username,
          email,
          password1,
          password2,
          store_name,
          business_email,
          phone_number,
          business_address,
          tax_id
        } = formData;

        // Construct the payload to match the backend's nested serializer expectation
        const sellerPayload = {
          username,
          email,
          password1,
          password2,
          seller_profile: { // This is the nested object
            store_name: store_name || '', // Ensure strings, even if empty/optional
            business_email: business_email || '',
            phone_number: phone_number || '',
            business_address: business_address || '',
            tax_id: tax_id || '' // tax_id is optional, ensure it's sent if present
          }
        };
        // Cast formData to SellerRegistrationFormData as we've validated all required fields
        registeredUser = await registerSeller(sellerPayload as SellerRegistrationFormData);
      }
      setIsSuccess(true);
      loginSuccess(registeredUser); // Update global auth state with the new user
      console.log('Registration successful, user data passed to AuthContext.');

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard'); // Or wherever you want to redirect after registration
      }, 2000);

    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unknown error occurred during registration.');
      }
      console.error('Registration API error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mx-4 mt-4 text-left bg-white shadow-lg md:w-1/3 sm:w-1/2 rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-800">Register</h3>

        {/* User Type Selection */}
        <div className="mt-6">
          <label className="block font-semibold text-gray-700 mb-2">Register As:</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="userType"
                value="buyer"
                checked={userType === 'buyer'}
                onChange={handleUserTypeChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700">Buyer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="userType"
                value="seller"
                checked={userType === 'seller'}
                onChange={handleUserTypeChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700">Seller</span>
            </label>
          </div>
          <FieldError message={errors.userType} />
        </div>

        {/* Form Submission Messages */}
        {isSuccess ? (
          <div className="text-green-600 text-center mb-4 p-3 bg-green-100 border border-green-400 rounded">
            Registration successful! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* General submit error display */}
            {submitError && (
              <div className="text-red-500 text-center mt-4 mb-4 p-2 bg-red-100 border border-red-400 rounded">
                {submitError}
              </div>
            )}

            {/* Username Field Group */}
            <div className="mt-4">
              <label htmlFor="username" className="block font-semibold text-gray-700">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
                id="username"
                placeholder="Enter your username"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.username} />
            </div>

            {/* Email Field Group */}
            <div className="mt-4">
              <label htmlFor="email" className="block font-semibold text-gray-700">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.email} />
            </div>

            {/* Password Field Group */}
            <div className="mt-4">
              <label htmlFor="password1" className="block font-semibold text-gray-700">Password</label>
              <input
                name="password1"
                value={formData.password1}
                onChange={handleChange}
                type="password"
                id="password1"
                placeholder="Create a password"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.password1} />
            </div>

            {/* Confirm Password Field Group */}
            <div className="mt-4">
              <label htmlFor="password2" className="block font-semibold text-gray-700">Confirm password</label>
              <input
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                type="password"
                id="password2"
                placeholder="Confirm your password"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.password2} />
            </div>

            {/* Seller Specific Fields (Conditional Rendering) */}
            {userType === 'seller' && (
              <>
                <div className="mt-4">
                  <label htmlFor="store_name" className="block font-semibold text-gray-700">Store Name</label>
                  <input
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    type="text"
                    id="store_name"
                    placeholder="e.g., My Awesome Store"
                    className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
                  />
                  <FieldError message={errors.store_name} />
                </div>
                <div className="mt-4">
                  <label htmlFor="business_email" className="block font-semibold text-gray-700">Business Email</label>
                  <input
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleChange}
                    type="email"
                    id="business_email"
                    placeholder="e.g., contact@myawesomestore.com"
                    className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
                  />
                  <FieldError message={errors.business_email} />
                </div>
                <div className="mt-4">
                  <label htmlFor="phone_number" className="block font-semibold text-gray-700">Phone Number</label>
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    type="tel"
                    id="phone_number"
                    placeholder="e.g., +1234567890"
                    className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
                  />
                  <FieldError message={errors.phone_number} />
                </div>
                <div className="mt-4">
                  <label htmlFor="business_address" className="block font-semibold text-gray-700">Business Address</label>
                  <input
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleChange}
                    type="text"
                    id="business_address"
                    placeholder="e.g., 123 Main St, Anytown"
                    className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
                  />
                  <FieldError message={errors.business_address} />
                </div>
                <div className="mt-4">
                  <label htmlFor="tax_id" className="block font-semibold text-gray-700">Tax ID (Optional)</label>
                  <input
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleChange}
                    type="text"
                    id="tax_id"
                    placeholder="Your tax identification number"
                    className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
                  />
                  <FieldError message={errors.tax_id} />
                </div>
              </>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform
                         bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-8"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {/* "Already have an account? Login" Link */}
        <div className="mt-6 text-center border-t pt-6 border-gray-200">
          <p className="mt-6 text-sm text-gray-600">
            Already have an account?
            <a href="/login" className="ml-1 text-blue-600 hover:underline hover:text-blue-700 cursor-pointer">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
