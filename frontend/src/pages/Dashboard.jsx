import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    note: "",
  });

  const getToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token;
};

const getUserInfo = () => {
  return JSON.parse(localStorage.getItem("userInfo"));
};

  useEffect(() => {
  const token = getToken();

  if (!token) {
    navigate("/login");
  } else {
    fetchExpenses();
    fetchBudget();
  }
}, [navigate]);
  
  const fetchExpenses = async () => {
  try {

    const res = await axios.get("https://moneywise-6v9a.onrender.com/api/expenses", {
      headers: {
        Authorization: `Bearer ${getToken()}`, 
      },
    });

    setExpenses(res.data);
  } catch (error) {
    console.log(error);
  }
};

  const fetchBudget = async () => {
  try {
    const res = await axios.get("https://moneywise-6v9a.onrender.com/api/budget", {
      headers: {
        Authorization: `Bearer ${getToken()}`, 
      },
    });
    setBudget(res.data.budget);
  } catch (error) {
    console.log(error);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //userInfo update
  const addExpense = async (e) => {
  e.preventDefault();

  try {


    await axios.post(
      "https://moneywise-6v9a.onrender.com/api/expenses",
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`, 
        },
      }
    );

    setFormData({
      title: "",
      amount: "",
      category: "",
      date: "",
      note: "",
    });

    fetchExpenses();
  } catch (error) {
    console.log(error);
  }
};

  const editHandler = (expense) => {
  setEditId(expense._id);
  setFormData({
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    date: expense.date?.substring(0, 10),
    note: expense.note || "",
  });
};

  const updateExpense = async (e) => {
  e.preventDefault();

  try {
    await axios.put(
      `https://moneywise-6v9a.onrender.com/api/expenses/${editId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`, 
        },
      }
    );

    setEditId(null);
    setFormData({
      title: "",
      amount: "",
      category: "",
      date: "",
      note: "",
    });

    fetchExpenses();
  } catch (error) {
    console.log(error);
  }
};

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`https://moneywise-6v9a.onrender.com/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`, 
        },
      });

      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleBudgetSave = async () => {
  try {
    await axios.put(
      "https://moneywise-6v9a.onrender.com/api/budget",
      { budget },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`, 
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

  const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const monthlyExpenses = expenses.filter((expense) => {
  const expenseDate = new Date(expense.date);

  return (
    expenseDate.getMonth() === currentMonth &&
    expenseDate.getFullYear() === currentYear
  );
});

const totalExpenses = monthlyExpenses.reduce(
  (acc, expense) => acc + expense.amount,
  0
);

const remainingBalance = (Number(budget) || 0) - totalExpenses;

const categoryData = [];

expenses.forEach((expense) => {
  const existingCategory = categoryData.find(
    (item) => item.name === expense.category
  );

  if (existingCategory) {
    existingCategory.value += expense.amount;
  } else {
    categoryData.push({
      name: expense.category,
      value: expense.amount,
    });
  }
});

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A855F7",
  "#EF4444",
];
  

  return (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7 }}
    className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-7xl mx-auto">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome, {getUserInfo()?.name} 👋
        </h1>

        <button
          onClick={logoutHandler}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white p-6 rounded-2xl shadow transition-shadow duration-300 hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-2">Monthly Budget</h3>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Set Budget"
            className="border p-2 rounded w-full mb-3"
          />
          <button
            onClick={handleBudgetSave}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Save Budget
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white p-6 rounded-2xl shadow transition-shadow duration-300 hover:shadow-2xl">
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-500 mt-3">
            ₹{totalExpenses}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white p-6 rounded-2xl shadow transition-shadow duration-300 hover:shadow-2xl">
          <h3 className="text-lg font-semibold">Remaining Balance</h3>
          <p
            className={`text-3xl font-bold mt-3 ${
              remainingBalance < 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            ₹{remainingBalance}
          </p>
        </motion.div>
      </div>

      {/* Add Expense Form */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add Expense</h2>

        <form
        onSubmit={addExpense}
        className="grid md:grid-cols-5 gap-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <select
  name="category"
  value={formData.category}
  onChange={handleChange}
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

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />

          <button
  type="submit"
  className="bg-green-500 text-white rounded px-4 py-3 hover:bg-green-600"
>
  Add
</button>
        </form>
      </motion.div>

      {/* Expense List */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Expense History</h2>
        <div className="bg-white p-6 rounded-2xl shadow mt-8">
  <h2 className="text-2xl font-semibold mb-4">
    Expense Statistics
  </h2>

  <div className="w-full h-96">
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          outerRadius={120}
          label
        >
          {categoryData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

        <div className="space-y-3">
  {expenses.map((expense) => (
    <div key={expense._id} className="border p-4 rounded-lg">

      {editId === expense._id ? (
        // ✅ Inline Edit Form
        <div className="grid md:grid-cols-5 gap-3">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="border p-2 rounded"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border p-2 rounded"
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
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={updateExpense}
              className="bg-blue-500 text-white px-3 py-2 rounded w-full"
            >
              Update
            </button>
            <button
              onClick={() => setEditId(null)}
              className="bg-gray-400 text-white px-3 py-2 rounded w-full"
            >
              Cancel
            </button>
          </div>
        </div>

      ) : (
        // ✅ Normal View
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold">{expense.title}</h4>
            <p className="text-sm text-gray-500">
              {expense.category} • ₹{expense.amount}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => editHandler(expense)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => deleteExpense(expense._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}

    </div>
  ))}
</div> 
      </div>

    </div>
  </motion.div>
);
}

export default Dashboard;