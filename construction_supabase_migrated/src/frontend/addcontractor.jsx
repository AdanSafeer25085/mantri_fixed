import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { contractorsApi, activitiesApi } from "../lib/supabase";

export default function AddContractor() {
  const [formData, setFormData] = useState({
    activity: "",
    name: "",
    pan: "",
    contact: "",
    bank: "",
    accountNo: "",
    ifsc: "",
  });

  const [activities, setActivities] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const editId = location.state?.editId;

  // 🔹 Fetch Activities for Dropdown
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activitiesApi.getAll();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };
    fetchActivities();
  }, []);

  // Prefill for edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await contractorsApi.getById(editId);
        const src = data?.data || data;
        if (src) {
          setFormData({
            activity: src.activity?._id || src.activity || "",
            name: src.name || "",
            pan: src.pan || "",
            contact: src.contact || "",
            bank: src.bank || "",
            accountNo: src.accountNo || "",
            ifsc: src.ifsc || "",
          });
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load contractor for editing");
      }
    })();
  }, [editId]);

  // 🔹 Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Submit Form (POST to API)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transform form data to match database schema
    const apiData = {
      name: formData.name,
      pan: formData.pan,
      contact: formData.contact,
      bank: formData.bank,
      ifsc: formData.ifsc,
      activity_id: formData.activity,
      account_no: formData.accountNo,
    };

    try {
      if (editId) {
        await contractorsApi.update(editId, apiData);
        alert("Contractor updated successfully!");
      } else {
        await contractorsApi.create(apiData);
        alert("Contractor added successfully!");
      }

      // reset form
      setFormData({
        activity: "",
        name: "",
        pan: "",
        contact: "",
        bank: "",
        accountNo: "",
        ifsc: "",
      });
      navigate("/dashboard/contractors");
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4 sm:px-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            {editId ? "Edit Contractor" : "Contractor Details"}
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Fill out the form below to add a new contractor
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Activity Dropdown */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Activity <span className="text-red-500">*</span>
            </label>
            <select
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
              required
            >
              <option value="">Select Activity</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter contractor name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
              required
            />
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              PAN
            </label>
            <input
              type="text"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              placeholder="Enter PAN number"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Contact Details
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
            />
          </div>

          {/* Bank */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Bank Details
            </label>
            <input
              type="text"
              name="bank"
              value={formData.bank}
              onChange={handleChange}
              placeholder="Enter bank name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
            />
          </div>

          {/* Account No */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Account No.
            </label>
            <input
              type="text"
              name="accountNo"
              value={formData.accountNo}
              onChange={handleChange}
              placeholder="Enter account number"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
            />
          </div>

          {/* IFSC */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleChange}
              placeholder="Enter IFSC code"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2044E4] focus:border-[#2044E4] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-[#2044E4] text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors"
            >
              {editId ? "Save Changes" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
