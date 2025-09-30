import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { leadsApi } from "../lib/supabase";

export default function AddLead() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;
  const editId = location.state?.editId;
  const [lead, setLead] = useState({
    full_name: "",
    contact_no: "",
    next_visit: "",
    visit_date: "",
    note: "",
    lead_type: "New",
    is_converted: false,
    aadhar_no: "",
    address: "",
    unit_no: "",
    budget: "",
  });

  const [convertedLeads, setConvertedLeads] = useState([]);

  // Fetch all converted leads
  const fetchConvertedLeads = async () => {
    try {
      const data = await leadsApi.getAll();
      const converted = data.filter(lead => lead.is_converted);
      setConvertedLeads(converted);
    } catch (err) {
      console.error("Error fetching converted leads:", err);
    }
  };

  useEffect(() => {
    fetchConvertedLeads();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await leadsApi.getAll();
        const src = data.find(lead => lead.id === editId);
        if (src) {
          setLead({
            full_name: src.full_name || "",
            contact_no: src.contact_no || "",
            next_visit: src.next_visit ? src.next_visit.substring(0,10) : "",
            visit_date: src.visit_date ? src.visit_date.substring(0,10) : "",
            note: src.note || "",
            lead_type: src.lead_type || "",
            is_converted: Boolean(src.is_converted),
            aadhar_no: src.aadhar_no || "",
            address: src.address || "",
            unit_no: src.unit_no || "",
            budget: src.budget || "",
          });
        }
      } catch (error) {
        console.error("Error loading lead:", error);
        alert("Failed to load lead for editing");
      }
    })();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLead((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const leadData = {
        full_name: lead.full_name,
        primary_contact: lead.contact_no,
        secondary_contact: lead.secondary_contact || null,
        aadhar_no: lead.aadhar_no,
        address: lead.address,
        project: projectId,
        status: lead.status || 'Active',
        // Convert empty strings to null for numeric fields
        budget: lead.budget === '' ? null : lead.budget
      };

      if (editId) {
        await leadsApi.update(editId, leadData);
        alert(`✅ Lead updated successfully!`);
      } else if (lead.is_converted) {
        // Directly create a customer when "Is Converted" is checked
        const { customersApi } = await import("../lib/supabase");
        const customerData = {
          datetime: new Date().toISOString(),
          full_name: lead.full_name,
          primary_contact: lead.contact_no,
          secondary_contact: null,
          aadhar_no: lead.aadhar_no,
          address: lead.address,
          unit_no: lead.unit_no,
          amount: lead.budget === '' ? null : lead.budget,
          project: projectId
        };
        await customersApi.create(customerData);
        alert(`✅ Customer "${lead.full_name}" created successfully!`);
      } else {
        // Create a regular lead
        await leadsApi.create(leadData);
        alert(`✅ Lead "${lead.full_name}" added successfully!`);
      }

      setLead({
        full_name: "",
        contact_no: "",
        next_visit: "",
        visit_date: "",
        note: "",
        lead_type: "New",
        is_converted: false,
        aadhar_no: "",
        address: "",
        unit_no: "",
        budget: "",
      });

      if (lead.is_converted) {
        fetchConvertedLeads();
        // Go to customers page after creating a customer
        navigate("/dashboard/customers", { state: { projectId } });
      } else {
        // Go to leads page after creating a lead
        navigate("/dashboard/leads", { state: { projectId } });
      }
    } catch (error) {
      console.error("Error saving:", error);
      const message = lead.is_converted
        ? "❌ Failed to create customer. Please try again."
        : "❌ Failed to save lead. Please try again.";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 sm:py-12 px-4">
      {/* Add Lead Form */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editId ? "Edit Lead" : "Add New Lead"}
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Fill out the form below to add a new lead
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={lead.full_name}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Contact No */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Contact No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_no"
              value={lead.contact_no}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Visit Dates */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
        Preset Visit Date
            </label>
            <input
              type="date"
              name="visit_date"
              value={lead.visit_date}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Next Visit Date
            </label>
            <input
              type="date"
              name="next_visit"
              value={lead.next_visit}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Note */}
          <div className="sm:col-span-2">
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Note
            </label>
            <input
              type="text"
              name="note"
              value={lead.note}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Lead Type */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Lead Type
            </label>
            <select
              name="lead_type"
              value={lead.lead_type}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="New">New</option>
              <option value="Cold">Cold</option>
              <option value="Warm">Warm</option>
              <option value="Hot">Hot</option>
            </select>
          </div>

          {/* Converted Checkbox */}
          <div className="flex items-center space-x-2 sm:col-span-2">
            <input
              type="checkbox"
              name="is_converted"
              checked={lead.is_converted}
              onChange={handleChange}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <label className="text-sm sm:text-base font-medium text-gray-600">Is Converted</label>
          </div>

          {/* Extra Customer Fields */}
          {lead.is_converted && (
            <>
              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Aadhar No
                </label>
                <input
                  type="text"
                  name="aadhar_no"
                  value={lead.aadhar_no}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={lead.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Unit No
                </label>
                <input
                  type="text"
                  name="unit_no"
                  value={lead.unit_no}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Amount
                </label>
                <input
                  type="number"
                  name="budget"
                  value={lead.budget}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200">
              {lead.is_converted ? "Convert to Customer" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>

      {/* Converted Leads Table */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Converted Leads</h2>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {convertedLeads.length > 0 ? (
            convertedLeads.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {c.full_name}</div>
                  <div><span className="font-medium">Contact:</span> {c.contact_no}</div>
                  <div><span className="font-medium">Aadhar:</span> {c.aadhar_no}</div>
                  <div><span className="font-medium">Unit:</span> {c.unit_no}</div>
                  <div><span className="font-medium">Amount:</span> {c.budget}</div>
                  <div><span className="font-medium">Type:</span> {c.lead_type}</div>
                  <div className="col-span-2"><span className="font-medium">Address:</span> {c.address}</div>
                  <div><span className="font-medium">Visit:</span> {c.visit_date ? new Date(c.visit_date).toLocaleDateString() : "-"}</div>
                  <div><span className="font-medium">Next:</span> {c.next_visit ? new Date(c.next_visit).toLocaleDateString() : "-"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No converted leads found
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Full Name</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Contact No</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Aadhar No</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Address</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Unit No</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Amount</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Visit Date</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Next Visit</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Lead Type</th>
              </tr>
            </thead>
            <tbody>
              {convertedLeads.length > 0 ? (
                convertedLeads.map((c) => (
                  <tr key={c.id} className="text-center">
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.full_name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.contact_no}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.aadhar_no}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.address}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.unit_no}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.budget}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.visit_date
                        ? new Date(c.visit_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.next_visit
                        ? new Date(c.next_visit).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.lead_type}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No converted leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
