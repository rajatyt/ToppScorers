import React, { useState, useMemo } from 'react';
import { 
  FaCoins, FaCalculator, FaChartLine, FaCheckCircle, 
  FaInfoCircle, FaShieldAlt, FaArrowRight, FaUserFriends, FaRupeeSign
} from 'react-icons/fa';
import { FiDollarSign, FiPercent, FiTrendingUp } from 'react-icons/fi';

const EarningsCalculator = () => {
  const [students, setStudents] = useState(5);
  const [fee, setFee] = useState(2600);

  // Calculations
  const calculations = useMemo(() => {
    const monthlyTotal = students * fee;
    const firstMonthEarnings = Math.round(monthlyTotal * 0.5); // After 50% service charge
    const month2Onwards = monthlyTotal; // 100% yours
    const ongoingCommission = 0; // 0 ongoing commission
    // Year 1 total = 1st month (50%) + remaining 11 months (100%) = 11.5 months
    const yearlyProjection = Math.round((monthlyTotal * 0.5) + (monthlyTotal * 11));

    const formatCompact = (num, perMonth = false) => {
      if (num === 0) return '₹0';
      if (num >= 100000) {
        const inLakhs = (num / 100000).toFixed(1).replace(/\.0$/, '');
        return `₹${inLakhs}L${perMonth ? '/mo' : ''}`;
      }
      if (num >= 1000) {
        const inK = (num / 1000).toFixed(1).replace(/\.0$/, '');
        return `₹${inK}K${perMonth ? '/mo' : ''}`;
      }
      return `₹${num.toLocaleString()}${perMonth ? '/mo' : ''}`;
    };

    return {
      monthlyTotal,
      firstMonthEarnings,
      month2Onwards,
      ongoingCommission,
      yearlyProjection,
      monthlyTotalFormatted: formatCompact(monthlyTotal, true),
      firstMonthFormatted: formatCompact(firstMonthEarnings),
      month2OnwardsFormatted: formatCompact(month2Onwards, true),
      yearlyProjectionFormatted: formatCompact(yearlyProjection),
      ongoingCommissionFormatted: '₹0'
    };
  }, [students, fee]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/25 text-xs font-black uppercase tracking-wider mb-1">
            <span className="text-base">💰</span>
            <span>Verified Teacher Benefit</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Earnings Calculator</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Adjust sliders to estimate your potential income
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 text-emerald-800 text-xs font-bold">
          <FaCheckCircle className="text-emerald-600" />
          <span>Keep 100% From Month 2</span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60">
        {/* Slider 1: Number of Students */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FaUserFriends className="text-amber-500" />
              <span>Number of Students</span>
            </label>
            <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-xs font-extrabold shadow-xs">
              {students} {students === 1 ? 'student' : 'students'}
            </span>
          </div>

          <div className="pt-2">
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 px-0.5">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>30+</span>
            </div>
          </div>
        </div>

        {/* Slider 2: Avg. Monthly Fee per Student */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="font-extrabold text-emerald-600">₹</span>
              <span>Avg. Monthly Fee per Student</span>
            </label>
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-xs">
              ₹{fee.toLocaleString()}
            </span>
          </div>

          <div className="pt-2">
            <input
              type="range"
              min="800"
              max="15000"
              step="100"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 px-0.5">
              <span>₹800</span>
              <span>₹4,000</span>
              <span>₹8,000</span>
              <span>₹15,000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection 4-Card Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Earnings From Month 2 Onwards */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="text-[11px] font-black uppercase tracking-wider text-emerald-100 mb-1">
            Monthly Earnings From Month 2 Onwards
          </div>
          <div className="text-3xl font-black tracking-tight text-white mt-1">
            {calculations.month2OnwardsFormatted}
          </div>
          <p className="text-[11px] text-emerald-100 font-medium mt-2 leading-snug">
            100% yours — no commission after 1st month
          </p>
        </div>

        {/* Card 2: Yearly Projection */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Yearly Projection
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 mt-1">
            {calculations.yearlyProjectionFormatted}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 leading-snug">
            At same student count
          </p>
        </div>

        {/* Card 3: 1st Month Earning */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            1st Month Earning
          </div>
          <div className="text-3xl font-black tracking-tight text-amber-600 mt-1">
            {calculations.firstMonthFormatted}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 leading-snug">
            After 50% service charge
          </p>
        </div>

        {/* Card 4: Ongoing Commission */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Ongoing Commission
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 mt-1">
            {calculations.ongoingCommissionFormatted}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-2 leading-snug">
            From month 2 onwards
          </p>
        </div>
      </div>

      {/* 📊 Earnings Breakdown Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span>📊</span>
          <span>Earnings Breakdown</span>
        </h3>

        <div className="space-y-3 text-xs sm:text-sm divide-y divide-slate-200/60">
          <div className="flex items-center justify-between pt-1">
            <span className="font-medium text-slate-600">Total fees from students / month</span>
            <span className="font-extrabold text-slate-900">{calculations.monthlyTotalFormatted}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="font-medium text-slate-600">1st month (after 50% service charge)</span>
            <span className="font-extrabold text-amber-700">{calculations.firstMonthFormatted}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="font-medium text-slate-600">From month 2 onwards (100% yours)</span>
            <span className="font-black text-emerald-600 text-base">{calculations.month2OnwardsFormatted}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="font-medium text-slate-600">Break-even after 1st month?</span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
              <FaCheckCircle className="text-emerald-600" />
              <span>Yes — in Month 1!</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsCalculator;
