import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { financesApi, vendorsApi, contractorsApi, customersApi, projectsApi } from "../lib/supabase";

export default function AddFinance() {
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location.state?.editId;

  const [entry, setEntry] = useState({
    date: "",
    project: "General",
    type: "Credit", // ✅ start with valid value
    creditHead: "Other",
    creditOption: "Other",
    debitOption: "",
    customer: "",
    contractor: "",
    vendor: "",
    description: "",
    mode: "Cheque",
    paymentRef: "",
    amount: ""
  });

  // API states
  const [vendors, setVendors] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Fetch vendors, contractors, customers, and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorsData, contractorsData, customersData, projectsData] = await Promise.all([
          vendorsApi.getAll(),
          contractorsApi.getAll(),
          customersApi.getAll(),
          projectsApi.getAll(),
        ]);

        setVendors(vendorsData);
        setContractors(contractorsData);
        setCustomers(customersData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Prefill on edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await financesApi.getAll();
        const src = data.find(finance => finance.id === editId);
        if (src) {
          setEntry({
            date: src.date ? src.date.substring(0,10) : "",
            project: src.project?.id || src.project || "General",
            type: src.type || "Credit",
            creditHead: src.creditHead || "Other",
            creditOption: src.creditOption || (src.type === "Credit" ? "Other" : "Other"),
            debitOption: src.debitOption || "",
            customer: src.customer?.id || "",
            contractor: src.contractor?.id || "",
            vendor: src.vendor?.id || "",
            description: src.description || "",
            mode: src.mode || "Cheque",
            paymentRef: src.paymentRef || src.chequeNo || "",
            amount: src.amount ?? "",
          });
        }
      } catch (error) {
        console.error("Error loading finance entry:", error);
        alert("Failed to load finance entry for editing");
      }
    })();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic client-side validation
    if (!entry.date || !entry.amount || !entry.paymentRef) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        project: entry.project === "General" ? "General" : entry.project,
        project_id: entry.project === "General" ? null : entry.project,
        category: entry.debitOption, // Map debitOption to category
        description: entry.description,
        amount: parseFloat(entry.amount) || 0,
        date: entry.date,
        type: entry.creditOption // Map creditOption to type
      };

      if (editId) {
        await financesApi.update(editId, payload);
        alert("Finance entry updated!");
      } else {
        await financesApi.create(payload);
        alert("Finance entry added!");
      }

      navigate("/dashboard/project-finance");
    } catch (error) {
      console.error("Error saving finance entry:", error);
      alert("Error: Could not save entry");
    }
  };

  const getPaymentLabel = () => {
    switch (entry.mode) {
      case "Cheque":
        return "Cheque No.";
      case "Account Pay":
        return "Transaction ID";
      case "Cash":
      case "Major Cash":
        return "Receipt No.";
      default:
        return "Reference";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editId ? "Edit Transaction" : "Add Transaction"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* DATE */}
        <div>
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Date*</label>
          <input
            type="date"
            name="date"
            value={entry.date}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PROJECT */}
        <div>
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Project*</label>
          <select
            name="project"
            value={entry.project}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="General">General</option>
            {projects.map((p) =>
              p?.id && p.name ? (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ) : null
            )}
          </select>
        </div>

        {/* TYPE */}
        <div>
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Transaction Type*</label>
          <select
            name="type"
            value={entry.type}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </select>
        </div>

        {/* CREDIT */}
        {entry.type === "Credit" && (
          <div className="sm:col-span-2">
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Credit Option</label>
            <select
              name="creditOption"
              value={entry.creditOption}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Customer">Customer</option>
              <option value="Other">Other</option>
            </select>

            {entry.creditOption === "Customer" && (
              <div className="mt-3 sm:mt-4">
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Select Customer</label>
                <select
                  name="customer"
                  value={entry.customer}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) =>
                    c?.id && c.fullName ? (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            )}
          </div>
        )}

        {/* DEBIT */}
        {entry.type === "Debit" && (
          <div className="sm:col-span-2">
            <p className="mb-2 sm:mb-3 text-sm font-medium text-gray-600">Debit Option</p>
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Labour */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <label className="inline-flex items-center text-gray-700 text-sm sm:text-base">
                  <input
                    type="radio"
                    name="debitOption"
                    value="Labour"
                    checked={entry.debitOption === "Labour"}
                    onChange={handleChange}
                    className="mr-2 accent-blue-500"
                  />
                  Labour
                </label>
                {entry.debitOption === "Labour" && (
                  <select
                    name="contractor"
                    value={entry.contractor}
                    onChange={handleChange}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Contractor</option>
                    {contractors.map((c) =>
                      c?.id && c.name ? (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ) : null
                    )}
                  </select>
                )}
              </div>

              {/* Material */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <label className="inline-flex items-center text-gray-700 text-sm sm:text-base">
                  <input
                    type="radio"
                    name="debitOption"
                    value="Material"
                    checked={entry.debitOption === "Material"}
                    onChange={handleChange}
                    className="mr-2 accent-blue-500"
                  />
                  Material
                </label>
                {entry.debitOption === "Material" && (
                  <select
                    name="vendor"
                    value={entry.vendor}
                    onChange={handleChange}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) =>
                      v?.id && v.name ? (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ) : null
                    )}
                  </select>
                )}
              </div>

              {/* Salary */}
              <label className="inline-flex items-center text-gray-700 text-sm sm:text-base">
                <input
                  type="radio"
                  name="debitOption"
                  value="Salary"
                  checked={entry.debitOption === "Salary"}
                  onChange={handleChange}
                  className="mr-2 accent-blue-500"
                />
                Salary
              </label>

              {/* Office */}
              <label className="inline-flex items-center text-gray-700 text-sm sm:text-base">
                <input
                  type="radio"
                  name="debitOption"
                  value="Office"
                  checked={entry.debitOption === "Office"}
                  onChange={handleChange}
                  className="mr-2 accent-blue-500"
                />
                Office
              </label>

              {/* Other */}
              <label className="inline-flex items-center text-gray-700 text-sm sm:text-base">
                <input
                  type="radio"
                  name="debitOption"
                  value="Other"
                  checked={entry.debitOption === "Other"}
                  onChange={handleChange}
                  className="mr-2 accent-blue-500"
                />
                Other
              </label>
            </div>
          </div>
        )}

        {/* DESCRIPTION */}
        <div className="sm:col-span-2">
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Description</label>
          <input
            type="text"
            name="description"
            value={entry.description}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* MODE */}
        <div>
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Mode of Payment*</label>
          <select
            name="mode"
            value={entry.mode}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Cheque">Cheque</option>
            <option value="Account Pay">Account Pay</option>
            <option value="Cash">Cash</option>
            <option value="Major Cash">Major Cash</option>
          </select>
        </div>

        {/* PAYMENT REF */}
        <div>
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">{getPaymentLabel()}*</label>
          <input
            type="text"
            name="paymentRef"
            value={entry.paymentRef}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* AMOUNT */}
        <div>
          <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">Amount*</label>
          <input
            type="number"
            name="amount"
            value={entry.amount}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* SUBMIT */}
        <div className="sm:col-span-2 mt-4 sm:mt-6">
          <button
            type="submit"
            className="w-full py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
          >
            Save Finance Entry
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
