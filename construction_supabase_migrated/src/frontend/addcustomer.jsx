import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { customersApi } from "../lib/supabase";

export default function AddCustomer() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId;
  const editId = location.state?.editId;
  const [formData, setFormData] = useState({
    datetime: "",
    full_name: "",
    primary_contact: "",
    secondary_contact: "",
    aadhar_no: "",
    address: "",
    unit_no: "",
    amount: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await customersApi.getById(editId);
        const src = data?.data || data;
        if (src) {
          setFormData({
            datetime: src.datetime ? new Date(src.datetime).toISOString().slice(0,16) : "",
            full_name: src.full_name || "",
            primary_contact: src.primary_contact || "",
            secondary_contact: src.secondary_contact || "",
            aadhar_no: src.aadhar_no || "",
            address: src.address || "",
            unit_no: src.unit_no || "",
            amount: src.amount || "",
          });
        }
      } catch (e) {
        console.error(e);
        setMessage("❌ Failed to load customer for editing");
      }
    })();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const customerData = { ...formData, project: projectId };
      if (editId) {
        await customersApi.update(editId, customerData);
        setMessage("✅ Customer updated successfully!");
      } else {
        await customersApi.create(customerData);
        setMessage("✅ Customer saved successfully!");
      }

      setFormData({
        datetime: "",
        full_name: "",
        primary_contact: "",
        secondary_contact: "",
        aadhar_no: "",
        address: "",
        unit_no: "",
        amount: "",
      }); // reset form
      setTimeout(() => navigate("/dashboard/customers", { state: { projectId } }), 800);
    } catch (error) {
      setMessage("❌ Failed to save customer: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editId ? "Edit Customer" : "Add New Customer"}
          </h2>
        </div>

        {message && (
          <p className="mb-4 sm:mb-6 text-center font-semibold text-red-500 text-sm sm:text-base">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Date/Time */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Date/Time</label>
            <input
              type="datetime-local"
              name="datetime"
              value={formData.datetime}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Primary Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Primary Contact</label>
            <input
              type="tel"
              name="primary_contact"
              value={formData.primary_contact}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Secondary Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Secondary Contact</label>
            <input
              type="tel"
              name="secondary_contact"
              value={formData.secondary_contact}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Aadhar No */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Aadhar No</label>
            <input
              type="text"
              name="aadhar_no"
              value={formData.aadhar_no}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>

          {/* Unit No */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Unit No</label>
            <input
              type="text"
              name="unit_no"
              value={formData.unit_no}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 transition duration-200"
            >
              {editId ? "Save Changes" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
