import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";

function Stats() {
  const [expenses, setExpenses] = useState([]);
  const [chartType, setChartType] = useState("pie");
  const [filterType, setFilterType] = useState("monthly");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        "https://moneywise-6v9a.onrender.com/api/expenses",
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
       }
      );

    

      setExpenses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setExpenses([]);
    }
  };

  // 🔥 Dynamic Data Based on Filter
  let data = [];

  if (filterType === "monthly") {
  const monthOrder = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // Step 1: initialize ALL months with 0
  const monthlyMap = {};
  for (let i = 0; i < 12; i++) {
    monthlyMap[i] = 0;
  }

  // Step 2: add actual expenses
  expenses.forEach((exp) => {
    const monthIndex = new Date(exp.date).getMonth();
    monthlyMap[monthIndex] += exp.amount;
  });

  // Step 3: convert to array (already ordered!)
  data = monthOrder.map((month, index) => ({
    name: month,
    value: monthlyMap[index],
  }));
}

  else if (filterType === "yearly") {
  const yearlyMap = {};

  expenses.forEach((exp) => {
    const year = new Date(exp.date).getFullYear();

    yearlyMap[year] = (yearlyMap[year] || 0) + exp.amount;
  });

  data = Object.keys(yearlyMap)
    .map((key) => ({
      name: key,
      value: yearlyMap[key],
    }))
    .sort((a, b) => b.name - a.name)   // ✅ sorted
}

  else {
    // Daily → category split
    const categoryMap = {};

    expenses.forEach((exp) => {
      categoryMap[exp.category] =
        (categoryMap[exp.category] || 0) + exp.amount;
    });

    data = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
    }));
  }
  
  // 🔥 Insights
const highestMonth = data.reduce((max, item) =>
  item.value > max.value ? item : max,
  data[0] || {}
);

const lowestMonth = data.reduce((min, item) =>
  item.value < min.value ? item : min,
  data[0] || {}
);

const totalSpending = data.reduce((sum, item) => sum + item.value, 0);

    // 🔥 Monthly comparison
let comparisonText = "";

if (filterType === "monthly" && data.length >= 2) {
  const sorted = [...data]
  .filter((item) => item.value > 0)
  .sort(
    (a, b) =>
      new Date(`1 ${a.name} 2024`).getTime() -
      new Date(`1 ${b.name} 2024`).getTime()
  );

  if (sorted.length >= 2) {
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  const diff = last.value - prev.value;

  let percent = 0;

  if (prev.value > 0) {
    percent = ((diff / prev.value) * 100).toFixed(1);
  }

  if (diff > 0) {
    comparisonText = `⚠️ You spent ${percent}% more than last month`;
  } else {
    comparisonText = `✅ You spent ${Math.abs(percent)}% less than last month`;
  }
} else {
  comparisonText = "Not enough monthly data to compare";
}
}

    // 🔥 Top Category Detection (only for daily/category view)
let topCategoryText = "";

if (filterType === "daily" && data.length > 0) {
  const top = data.reduce((max, item) =>
    item.value > max.value ? item : max,
    data[0]
  );

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = ((top.value / total) * 100).toFixed(1);

  topCategoryText = `💡 ${top.name} takes ${percent}% of your spending`;
}

      const savedBudget = Number(localStorage.getItem("monthlyBudget")) || 0;

let budgetInsightText = "";

if (filterType === "monthly" && savedBudget > 0) {
  const currentMonthTotal =
    data.length > 0 ? data[data.length - 1].value : 0;

  const diff = currentMonthTotal - savedBudget;

  if (diff > 0) {
    budgetInsightText = `⚠️ You exceeded your budget by ₹${diff}`;
  } else {
    budgetInsightText = `✅ You are within budget by ₹${Math.abs(diff)}`;
  }
}

    let habitInsight = "";

if (filterType === "daily" && data.length > 0) {
  const top = data.reduce((max, item) =>
    item.value > max.value ? item : max,
    data[0]
  );

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const percent = (top.value / total) * 100;

  if (percent > 50) {
    habitInsight = `⚠️ You are spending too much on ${top.name}`;
  } else if (percent > 30) {
    habitInsight = `💡 ${top.name} is a major part of your expenses`;
  } else {
    habitInsight = `✅ Your spending is well balanced`;
  }
}

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A855F7",
    "#EF4444",
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>

      {/* 🔥 Controls */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="daily">Daily (Category)</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="pie">Pie Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>
          
      {/* 🔥 Insights Cards */}
<motion.div
 className="grid md:grid-cols-3 gap-6 mb-6">
  
  <motion.div className="bg-white p-4 rounded-xl shadow">
    <h3 className="text-gray-500">Highest Spending</h3>
    <p className="text-xl font-bold text-red-500">
      {highestMonth?.name} (₹{highestMonth?.value})
    </p>
  </motion.div>

  <motion.div className="bg-white p-4 rounded-xl shadow">
    <h3 className="text-gray-500">Lowest Spending</h3>
    <p className="text-xl font-bold text-green-500">
      {lowestMonth?.name} (₹{lowestMonth?.value})
    </p>
  </motion.div>

  <motion.div 
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{scale: 0.98 }}
  
    className="bg-white p-4 rounded-xl shadow">
    <h3 className="text-gray-500">Total Spending</h3>
    <p className="text-xl font-bold text-blue-500">
      ₹{totalSpending}
    </p>
  </motion.div>

</motion.div>

      {/* 🤖 AI Insight */}
{comparisonText && (
  <motion.div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded">
    <p className="font-semibold">Smart Insight</p>
    <p>{comparisonText}</p>
  </motion.div>
)}
    
      {/* 🧠 Top Category Insight */}
{topCategoryText && (
  <motion.div 
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{scale: 0.98 }}
    className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 mb-6 rounded">
    <p className="font-semibold">Category Insight</p>
    <p>{topCategoryText}</p>
  </motion.div>
)}

      {/* 💰 Budget Insight */}
{budgetInsightText && (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded">
    <p className="font-semibold">Budget Insight</p>
    <p>{budgetInsightText}</p>
  </div>
)}

      {/* 🧠 Spending Habit Insight */}
{habitInsight && (
  <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-4 mb-6 rounded">
    <p className="font-semibold">Spending Habit</p>
    <p>{habitInsight}</p>
  </div>
)}

      {/* 🔥 Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="w-full h-96">

          {/* PIE */}
          {chartType === "pie" && (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {data.map((entry, index) => (
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
          )}

          {/* BAR */}
          {chartType === "bar" && (
            <ResponsiveContainer>
              <BarChart data={[...data]}>
                <XAxis dataKey="name" interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* LINE */}
          {chartType === "line" && (
            <ResponsiveContainer>
              <LineChart data={[...data]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

        </div>
      </div>
    </div>
  );
}

export default Stats;