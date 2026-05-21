import axios from "axios";
import { useEffect, useState } from "react";

function Filter() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const [filterData, setFilterData] = useState({
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    category: "",
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("https://moneywise-6v9a.onrender.com/api/expenses", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      setExpenses(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilterInput = (e) => {
    setFilterData({
      ...filterData,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    const results = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const start = filterData.startDate
        ? new Date(filterData.startDate)
        : null;
      const end = filterData.endDate
        ? new Date(filterData.endDate)
        : null;

      const matchesDate =
        (!start || expenseDate >= start) &&
        (!end || expenseDate <= end);

      const matchesMin =
        !filterData.minAmount ||
        expense.amount >= Number(filterData.minAmount);

      const matchesMax =
        !filterData.maxAmount ||
        expense.amount <= Number(filterData.maxAmount);

      const matchesCategory =
        !filterData.category ||
        expense.category === filterData.category;

      return (
        matchesDate &&
        matchesMin &&
        matchesMax &&
        matchesCategory
      );
    });

    setFilteredExpenses(results);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Filter Expenses</h1>

      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input type="date" name="startDate" onChange={handleFilterInput} className="border p-3 rounded" />
          <input type="date" name="endDate" onChange={handleFilterInput} className="border p-3 rounded" />
          <input type="number" name="minAmount" placeholder="Min Amount" onChange={handleFilterInput} className="border p-3 rounded" />
          <input type="number" name="maxAmount" placeholder="Max Amount" onChange={handleFilterInput} className="border p-3 rounded" />

          <select
  name="category"
  value={filterData.category}
  onChange={handleFilterInput}
  className="border p-3 rounded"
  required
>
  <option value="">Select Category</option>
  <option value="Food">Food</option>
  <option value="Transport">Transport</option>
  <option value="Shopping">Shopping</option>
  <option value="Entertainment">Entertainment</option>
  <option value="Health">Health</option>
  <option value="Education">Education</option>
  <option value="Rent">Rent</option>
  <option value="Utilities">Utilities</option>
  <option value="Other">Other</option>
</select>

          <button
            onClick={applyFilters}
            className="bg-blue-500 text-white rounded px-4 py-3"
          >
            Filter Results
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <div
            key={expense._id}
            className="bg-white p-4 rounded shadow flex justify-between"
          >
            <div>
              <h4 className="font-semibold">{expense.title}</h4>
              <p>{expense.category} • ₹{expense.amount}</p>
            </div>
            <p>{expense.date?.substring(0, 10)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Filter;