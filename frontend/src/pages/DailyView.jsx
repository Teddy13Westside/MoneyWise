import axios from "axios";
import { useEffect, useState } from "react";

function DailyView() {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);

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

  // 🔥 Triggered by "Go" button (same as old project)
  const handleFilter = () => {
    const result = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
        .toISOString()
        .split("T")[0];

      return expenseDate === selectedDate;
    });

    setFilteredExpenses(result);
  };

  const total = filteredExpenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Daily View</h1>

      {/* 🔥 Date + Button (like old UI) */}
      <div className="flex gap-3 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-4 py-2 rounded"
        />

        <button
          onClick={handleFilter}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go
        </button>
      </div>

      {/* 🔥 Table View */}
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
                  <tr key={expense._id} className="text-center border-t">
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
                  <td colSpan="6" className="p-4 text-gray-500 text-center">
                    No data found
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

export default DailyView;