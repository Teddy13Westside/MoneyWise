import axios from "axios";
import { useEffect, useState } from "react";

function MonthlyView() {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // ✅ NEW: Year state (ADDED)
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get("https://moneywise-6v9a.onrender.com/api/expenses", {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });

      setExpenses(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ UPDATED: filter includes YEAR also
  const filteredExpenses = expenses.filter((expense) => {
    if (selectedMonth === null) return false;

    const date = new Date(expense.date);

    return (
      date.getMonth() === selectedMonth &&
      date.getFullYear() === selectedYear
    );
  });

  const total = filteredExpenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
     
        {/* Main Content */}
        <div className="w-4/5 p-6">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6">Monthly View</h1>

        {/* ✅ NEW: Year Selector (ADDED) */}
        <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">Select Year:</h2>

            <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-3 py-2 rounded"
            >
            {[
                ...new Set(
                expenses.map((expense) => new Date(expense.date).getFullYear())
                ),
            ]
                .sort((a, b) => b - a)
                .map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
                ))}
            </select>
        </div>

        {/* Month Buttons */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {months.map((m, i) => (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`p-2 rounded ${
                selectedMonth === i
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-blue-500 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedMonth === null ? (
          <p className="text-gray-600">
            Select a month to view expenses
          </p>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Total: ₹{total}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Note</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense, index) => (
                      <tr
                        key={expense._id}
                        className="text-center border-t"
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">₹{expense.amount}</td>
                        <td className="p-2">{expense.category}</td>
                        <td className="p-2">{expense.title}</td>
                        <td className="p-2">{expense.note}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-gray-500">
                        No expenses found for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyView;