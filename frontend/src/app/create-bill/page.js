"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { motion } from "framer-motion";

const billSchema = z.object({
  customerName: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .nonempty("Customer Name is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  billPrice: z.number().min(1, "Bill Price must be at least 1"),
  dateOfCall: z.string().nonempty("Date of Call is required"),
  billDate: z.string().nonempty("Bill Date is required"),
  state: z.enum(["pending", "paid"], "State must be either pending or paid"),
  description: z.string().optional(),
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

export default function CreateBill() {
  useEffect(() => {
    document.title = "إنشاء فاتورة جديدة";
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(billSchema),
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/bills", data);
      setToast({ message: "تم إنشاء الفاتورة بنجاح!", type: "success" });
      reset();
    } catch (error) {
      setToast({ message: "خطأ في إنشاء الفاتورة!", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
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
          إنشاء فاتورة جديدة
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <input
            {...register("customerName")}
            placeholder="اسم العميل"
            className="w-full p-3 border rounded-lg"
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm">
              {errors.customerName.message}
            </p>
          )}

          <input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            placeholder="الكمية"
            className="w-full p-3 border rounded-lg"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}

          <input
            type="number"
            {...register("billPrice", { valueAsNumber: true })}
            placeholder="إحمالي الفاتورة"
            className="w-full p-3 border rounded-lg"
          />
          {errors.billPrice && (
            <p className="text-red-500 text-sm">{errors.billPrice.message}</p>
          )}

          <div className="relative group">
            <div className="w-full p-3 border rounded-lg relative group">
              <input
                type="date"
                {...register("billDate")}
                className="w-full bg-transparent focus:outline-none"
              />
              <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-sm px-2 py-1 rounded-lg">
                تاريخ الفاتورة
              </span>
            </div>
          </div>

          <div className="relative group">
            <div className="w-full p-3 border rounded-lg relative group">
              <input
                type="date"
                {...register("dateOfCall")}
                className="w-full bg-transparent focus:outline-none"
              />
              <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm px-2 py-1 rounded-lg">
                تاريخ المكالمة
              </span>
            </div>
          </div>

          <select
            {...register("state")}
            className="w-full p-3 border rounded-lg"
          >
            <option value="pending">معلق</option>
            <option value="paid">مدفوع</option>
          </select>
          {errors.state && (
            <p className="text-red-500 text-sm">{errors.state.message}</p>
          )}

          <textarea
            {...register("description")}
            placeholder="الوصف (اختياري)"
            className="w-full p-3 border rounded-lg col-span-2"
          ></textarea>

          <button
            type="submit"
            className="col-span-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            disabled={loading || isSubmitting}
          >
            {loading ? "جارِ الإنشاء..." : "إنشاء فاتورة"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
