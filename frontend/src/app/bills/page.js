"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { Search, X } from "lucide-react";

export default function BillsPage() {
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    dateOfCall: "",
    discription: "",
    billDate: "",
    customerName: "",
    billPrice: "",
    state: "",
  });

  const apiURL = "http://localhost:5000";

  useEffect(() => {
    async function fetchBills() {
      try {
        const response = await fetch(`${apiURL}/api/bills`);
        if (!response.ok) throw new Error("Failed to fetch bills");
        const data = await response.json();
        setBills(data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذه الفاتورة؟")) return;
    try {
      await fetch(`${apiURL}/api/bills/${id}`, { method: "DELETE" });
      setBills(bills.filter((bill) => bill._id !== id));
      setSelectedBill(null);
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...selectedBill });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${apiURL}/api/bills/${selectedBill._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update bill");
      setBills(
        bills.map((bill) =>
          bill._id === selectedBill._id ? { ...bill, ...formData } : bill
        )
      );
      setSelectedBill({ ...selectedBill, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating bill:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredBills = bills.filter((bill) =>
    bill.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen text-right">
      <header className="flex flex-row-reverse justify-between items-center pb-4">
        <div className="relative w-64">
        <Search className="absolute left-2 top-2 text-gray-500" size={20} />
          <Input
            type="text"
            placeholder="بحث..."
            className="pl-8 px-2 py-1 rounded-md text-right w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <h1 className="text-2xl font-bold">الفواتير</h1>
      </header>

      {loading ? (
        <p className="text-center text-gray-600">جاري تحميل البيانات...</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">الاسم</th>
              <th className="p-3">السعر</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">تاريخ الاتصال</th>
              <th className="p-3">تاريخ الفاتورة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill._id} className="border-b">
                <td className="p-3">{bill.customerName}</td>
                <td className="p-3">{bill.billPrice}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded ${
                      bill.state === "paid"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {bill.state === "paid" ? "مدفوع" : "مسودة"}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(bill.dateOfCall).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {new Date(bill.billDate).toLocaleDateString()}
                </td>
                <td className="p-3 flex gap-x-2">
                  <Button
                    className="bg-blue-500 text-white"
                    onClick={() => setSelectedBill(bill)}
                  >
                    عرض
                  </Button>
                  <Button
                    className="bg-yellow-500 text-white"
                    onClick={() => {
                      setSelectedBill(bill);
                      handleEdit();
                    }}
                  >
                    تعديل
                  </Button>
                  <Button
                    className="bg-red-500 text-white"
                    onClick={() => handleDelete(bill._id)}
                  >
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-2 left-2 text-gray-600"
              onClick={() => setSelectedBill(null)}
            >
              <X size={20} />
            </button>
            {isEditing ? (
              <>
                <div className="flex flex-col gap-y-2 pt-4">
                  <Input
                    name="customerName"
                    value={formData.customerName || ""}
                    onChange={handleChange}
                    placeholder="الاسم"
                  />
                  <Input
                    name="billPrice"
                    value={formData.billPrice || ""}
                    onChange={handleChange}
                    placeholder="السعر"
                  />
                  <Input
                    name="state"
                    value={formData.state || ""}
                    onChange={handleChange}
                    placeholder="الحالة (paid/pending)"
                  /> 
                  <Input
                    name="discription"
                    value={formData.discription || ""}
                    onChange={handleChange}
                    placeholder="الوصف"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <Button
                    className="bg-green-500 text-white"
                    onClick={handleSave}
                  >
                    حفظ
                  </Button>
                  <Button
                    className="bg-gray-500 text-white"
                    onClick={() => setIsEditing(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">
                  {selectedBill.customerName}
                </h2>
                <p><strong>السعر:</strong> {selectedBill.billPrice}</p>
                {selectedBill.amount? (
                  <p><strong>الكمية:</strong> {selectedBill.amount}</p>
                ) : null}
                {selectedBill.dateOfCall? (
                  <p><strong>تاريخ الاتصال:</strong> {new Date(selectedBill.dateOfCall).toLocaleDateString()}</p>
                ) : null}
                {selectedBill.billDate? (
                  <p><strong>تاريخ الفاتورة:</strong> {new Date(selectedBill.billDate).toLocaleDateString()}</p> 
                ) : null}
                {selectedBill.discription ? (
                  <p><strong>الوصف:</strong> {selectedBill.discription}</p>
                ) : null}
                <p><strong>الحالة:</strong> {selectedBill.state === "paid" ? "مدفوع" : "مسودة"}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
