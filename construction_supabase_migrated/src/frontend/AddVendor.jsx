// src/frontend/AddVendor.js
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { vendorsApi } from "../lib/supabase";

export default function AddVendor() {
  const [formData, setFormData] = useState({
    name: "",
    gst: "",
    contact: "",
    bank: "",
    account_no: "",
    ifsc: "",
  });
  const location = useLocation();
  const navigate = useNavigate();
  const editId = location.state?.editId;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await vendorsApi.update(editId, formData);
        alert("Vendor updated successfully!");
      } else {
        await vendorsApi.create(formData);
        alert("Vendor submitted successfully!");
      }

      // reset form
      setFormData({
        name: "",
        gst: "",
        contact: "",
        bank: "",
        account_no: "",
        ifsc: "",
      });
      navigate("/dashboard/vendors");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await vendorsApi.getById(editId);
        const src = data?.data || data;
        if (src) {
          setFormData({
            name: src.name || "",
            gst: src.gst || "",
            contact: src.contact || "",
            bank: src.bank || "",
            account_no: src.account_no || "",
            ifsc: src.ifsc || "",
          });
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load vendor for editing");
      }
    })();
  }, [editId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">{editId ? "Edit Vendor" : "Add Vendor"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Name */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* GST */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">GST No.</label>
            <input
              type="text"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Contact Details</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bank */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Bank</label>
            <input
              type="text"
              name="bank"
              value={formData.bank}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account No */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Account No.</label>
            <input
              type="text"
              name="account_no"
              value={formData.account_no}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* IFSC */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">IFSC Code</label>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200"
            >
              {editId ? "Save Changes" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
