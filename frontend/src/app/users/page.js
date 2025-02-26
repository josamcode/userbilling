"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ClientsPage() {
  useEffect(() => {
    document.title = "العملاء";
  }, []);

  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    email: "",
    image: "",
  });

  const apiURL = "http://localhost:5000";

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch(`${apiURL}/api/users`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error("❌ خطأ أثناء جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد أنك تريد حذف هذا العميل؟"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`${apiURL}/api/users/${id}`, { method: "DELETE" });
      setClients(clients.filter((client) => client._id !== id));
      setSelectedClient(null);
    } catch (error) {
      console.error("❌ خطأ أثناء الحذف:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: selectedClient.name,
      country: selectedClient.country,
      email: selectedClient.email,
      image: selectedClient.image,
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/users/${selectedClient._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("❌ خطأ أثناء تحديث البيانات");

      const updatedClients = clients.map((client) =>
        client._id === selectedClient._id ? { ...client, ...formData } : client
      );

      setClients(updatedClients);
      setSelectedClient({ ...selectedClient, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl font-bold">العملاء</h1>
      </header>

      {loading ? (
        <p className="text-center text-gray-600">جاري تحميل البيانات...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card
              key={client._id}
              className="flex items-start p-4"
              onClick={() => setSelectedClient(client)}
            >
              {/* Text beside the avatar */}
              <div className="ml-20">
                <h2 className="text-lg font-semibold">{client.name}</h2>
                <p className="text-sm text-gray-500">{client.country}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              {/* Avatar at the top-left */}
              <div className="w-12 h-12">
                <Avatar
                  src={client.image}
                  alt={client.name}
                  name={client.name}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              className="absolute top-2 left-2 text-gray-600"
              onClick={() => setSelectedClient(null)}
            >
              <X size={20} />
            </button>
            {isEditing ? (
              <>
                <div className="flex flex-col gap-y-2 pt-4">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="الاسم"
                  />
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="الدولة"
                  />
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="البريد الإلكتروني"
                  />
                  <Input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="رابط الصورة"
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
                  {selectedClient.name}
                </h2>
                <p>
                  <strong>الدولة:</strong> {selectedClient.country}
                </p>
                <p>
                  <strong>البريد:</strong> {selectedClient.email}
                </p>
                <div className="mt-4 flex justify-between">
                  <Button
                    className="bg-blue-500 text-white"
                    onClick={handleEdit}
                  >
                    تعديل
                  </Button>
                  <Button
                    className="bg-red-500 text-white"
                    onClick={() => handleDelete(selectedClient._id)}
                  >
                    حذف
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
