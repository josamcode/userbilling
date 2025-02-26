"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaGlobe, FaUpload } from "react-icons/fa";

const userSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .nonempty("Name is required")
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be empty or spaces only",
    }),

  email: z
    .string()
    .email("Invalid email")
    .nonempty("Email is required")
    .refine((val) => val.trim().length > 0, {
      message: "Email cannot be empty or spaces only",
    }),

  country: z
    .string()
    .min(2, "Country name is too short")
    .nonempty("Country is required")
    .refine((val) => val.trim().length > 0, {
      message: "Country cannot be empty or spaces only",
    }),

  image: z.any().optional(),
});

const Toaster = ({ message, type }) =>
  message ? (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-3 rounded text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </motion.div>
  ) : null;

export default function AdminCreateUser() {
  useEffect(() => {
    document.title = "إنشاء عميل جديد";
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let imageFile = data.image[0];
      let imageName = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imageResponse = await axios.post(
          "http://localhost:5000/api/image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        imageName = imageResponse.data.filename;
      }

      await axios.post("http://localhost:5000/api/users", {
        name: data.name,
        email: data.email,
        country: data.country,
        image: imageName,
      });

      setToast({ message: "تم انشاء العميل بنجاح!", type: "success" });
      reset();
    } catch (error) {
      setToast({ message: "خطأ في انشاء العميل!", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const onImageChange = (event) => {
    setImageUploaded(event.target.files.length > 0);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Toaster message={toast?.message} type={toast?.type} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full flex flex-col space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-700">
          إنشاء عميل جديد
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-500" />
            <input
              {...register("name")}
              placeholder="الاسم"
              className="w-full p-3 pl-10 border rounded-lg"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
            <input
              {...register("email")}
              placeholder="البريد الإلكتروني"
              className="w-full p-3 pl-10 border rounded-lg"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="relative col-span-2">
            <FaGlobe className="absolute left-3 top-3 text-gray-500" />
            <input
              {...register("country")}
              placeholder="الدولة"
              className="w-full p-3 pl-10 border rounded-lg"
            />
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country.message}</p>
            )}
          </div>
          <div
            className={`relative col-span-2 border-2 border-dashed rounded-lg p-4 flex flex-col items-center cursor-pointer ${
              imageUploaded ? "bg-green-100" : "bg-white"
            }`}
          >
            <FaUpload className="text-gray-500 text-2xl mb-2" />
            <input
              type="file"
              {...register("image")}
              className="w-full opacity-0 absolute inset-0 cursor-pointer"
              accept="image/*"
              onChange={onImageChange}
            />
            <span className="text-gray-600">رفع صورة العميل</span>
          </div>
          <button
            type="submit"
            className="col-span-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            disabled={loading || isSubmitting}
          >
            {loading ? "جارِ الإنشاء..." : "إنشاء عميل"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
