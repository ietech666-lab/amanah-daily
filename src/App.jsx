import { useState, useEffect } from 'react';

import { db } from "./firebase";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export default function DailyChecksheetApp() {
  const [selectedMenu, setSelectedMenu] = useState('ibadah');
  const [activeTab, setActiveTab] = useState('home');

  const [newActivity, setNewActivity] = useState('');
  const [activityCategory, setActivityCategory] = useState('ibadah');

  const [customIbadah, setCustomIbadah] = useState([]);
  const [customKesehatan, setCustomKesehatan] = useState([]);

  const [deleteCategory, setDeleteCategory] = useState('ibadah');

  const [completedActivities, setCompletedActivities] = useState([]);

  const [appTitle, setAppTitle] = useState('Amanah Daily  ✨');

  const [newTitle, setNewTitle] = useState('Amanah Daily  ✨');
  const [weeklyStats, setWeeklyStats] = useState({
    ibadahDone: 0,
    kesehatanDone: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState({
    ibadahDone: 0,
    kesehatanDone: 0,
  });

  const [historyData, setHistoryData] = useState([]);
  const [evaluationFilter, setEvaluationFilter] =
    useState("all");

  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  const [selectedYear, setSelectedYear] =
    useState(new Date().getFullYear());

  const [ibadahActivities, setIbadahActivities] = useState([
    'Tahajud',
    'Subuh',
    'Dzikir Pagi',
    'Dhuha',
  ]);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const [kesehatanActivities, setKesehatanActivities] = useState([
    'Workout',
    'Sarapan',
    'Minum Susu',
    'Tidur Tepat Waktu',
  ]);

  useEffect(() => {
    loadTitle();
    loadActivities();
    loadCompletedActivities();
    loadWeeklyMonthlyStats();
    loadHistoryData();
  }, []);

  const currentActivities =
    selectedMenu === 'ibadah'
      ? [...ibadahActivities, ...customIbadah]
      : [...kesehatanActivities, ...customKesehatan];
  const ibadahTotal =
    ibadahActivities.length + customIbadah.length;

  const kesehatanTotal =
    kesehatanActivities.length +
    customKesehatan.length;

  const ibadahDone = completedActivities.filter(
    (item) =>
      [...ibadahActivities, ...customIbadah].includes(
        item
      )
  ).length;

  const kesehatanDone = completedActivities.filter(
    (item) =>
      [
        ...kesehatanActivities,
        ...customKesehatan,
      ].includes(item)
  ).length;

  const ibadahNotDone =
    ibadahTotal - ibadahDone;

  const kesehatanNotDone =
    kesehatanTotal - kesehatanDone;

  const ibadahPercent =
    ibadahTotal === 0
      ? 0
      : Math.round(
        (ibadahDone / ibadahTotal) * 100
      );

  const kesehatanPercent =
    kesehatanTotal === 0
      ? 0
      : Math.round(
        (kesehatanDone / kesehatanTotal) * 100
      );

  const totalActivities =
    ibadahTotal + kesehatanTotal;

  const totalCompleted =
    ibadahDone + kesehatanDone;

  const totalPercent =
    totalActivities === 0
      ? 0
      : Math.round(
        (totalCompleted / totalActivities) *
        100
      );

  const streakDays = weeklyStats.ibadahDone +
    weeklyStats.kesehatanDone;

  const currentDate = new Date();

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const monthDays = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  const allActivities = [
    ...ibadahActivities,
    ...customIbadah,
    ...kesehatanActivities,
    ...customKesehatan,
  ];

  const filteredActivities =
    evaluationFilter === "all"
      ? allActivities
      : evaluationFilter === "ibadah"
        ? [
          ...ibadahActivities,
          ...customIbadah,
        ]
        : [
          ...kesehatanActivities,
          ...customKesehatan,
        ];

  const getActivityStatus = (
    activity,
    day
  ) => {
    const currentYear =
      new Date().getFullYear();

    const currentMonth =
      new Date().getMonth();

    const checkDate = new Date(
      selectedYear,
      selectedMonth,
      day
    );

    const today = new Date();

    const dateString =
      checkDate.toISOString().split("T")[0];

    const found = historyData.find(
      (item) =>
        item.name === activity &&
        item.date === dateString
    );

    if (found) {
      return "done";
    }

    if (checkDate > today) {
      return "future";
    }

    return "miss";
  };

  const getActivityPercentage = (
    activity
  ) => {
    const currentDay =
      new Date().getDate();

    let done = 0;

    for (
      let day = 1;
      day <= currentDay;
      day++
    ) {
      if (
        getActivityStatus(
          activity,
          day
        ) === "done"
      ) {
        done++;
      }
    }

    return Math.round(
      (done / currentDay) * 100
    );
  };

  const getMonthlyTrend = () => {

    const currentMonth =
      new Date().getMonth();

    const trends = [];

    for (
      let month = 0;
      month <= currentMonth;
      month++
    ) {

      const monthActivities =
        historyData.filter((item) => {

          const itemDate =
            new Date(item.date);

          return (
            itemDate.getMonth() === month &&
            itemDate.getFullYear() ===
            new Date().getFullYear()
          );
        });

      const percentage = Math.round(
        (
          monthActivities.length /
          (
            (
              allActivities.length *
              new Date(
                new Date().getFullYear(),
                month + 1,
                0
              ).getDate()
            ) || 1
          )
        ) * 100
      );

      trends.push({
        month,
        percentage,
      });
    }

    return trends;
  };

  const monthlyTrend =
    getMonthlyTrend();

  const monthlyTotalActivities =
    (ibadahTotal + kesehatanTotal) *
    daysInMonth;

  const activityCounts = {};

  historyData.forEach((item) => {
    if (!activityCounts[item.name]) {
      activityCounts[item.name] = 0;
    }

    activityCounts[item.name]++;
  });

  const sortedActivities = Object.entries(
    activityCounts
  ).sort((a, b) => b[1] - a[1]);

  const mostConsistent =
    sortedActivities[0];

  const leastConsistent =
    sortedActivities[
    sortedActivities.length - 1
    ];

  const aiEvaluation = () => {
    if (!mostConsistent || !leastConsistent) {
      return {
        best: "-",
        weak: "-",
        advice: "Belum ada data yang cukup untuk dievaluasi.",
        target: "-"
      };
    }

    let advice = "";

    if (
      leastConsistent[0]
        .toLowerCase()
        .includes("tahajud")
    ) {
      advice =
        "Cobalah mulai Tahajud minimal 1x per minggu agar lebih mudah membangun konsistensi.";
    } else if (
      leastConsistent[0]
        .toLowerCase()
        .includes("olahraga") ||
      leastConsistent[0]
        .toLowerCase()
        .includes("workout")
    ) {
      advice =
        "Aktivitas kesehatan masih rendah. Targetkan minimal 3x per minggu.";
    } else {
      advice =
        `Tingkatkan konsistensi aktivitas "${leastConsistent[0]}" agar keseimbangan pengembangan diri lebih baik.`;
    }

    return {
      best: `${mostConsistent[0]} (${mostConsistent[1]}x)`,

      weak: `${leastConsistent[0]} (${leastConsistent[1]}x)`,

      advice,

      target:
        `${leastConsistent[0]} minimal ${leastConsistent[1] + 5
        }x bulan depan`
    };
  };

  const aiResult = aiEvaluation();

  const saveTitle = async () => {
    await setDoc(doc(db, "settings", "app"), {
      title: newTitle,
    });

    setAppTitle(newTitle);
  };

  const loadTitle = async () => {
    const docRef = doc(db, "settings", "app");

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setAppTitle(docSnap.data().title);
      setNewTitle(docSnap.data().title);
    }
  };

  const addActivity = async () => {
    if (!newActivity.trim()) return;

    const newData = {
      name: newActivity,
      category: activityCategory,
    };

    await addDoc(
      collection(db, "activities"),
      newData
    );

    if (activityCategory === 'ibadah') {
      setCustomIbadah([
        ...customIbadah,
        newActivity,
      ]);
    } else {
      setCustomKesehatan([
        ...customKesehatan,
        newActivity,
      ]);
    }

    setNewActivity('');
  };

  const deleteActivity = (category, item) => {
    if (category === 'ibadah') {
      setCustomIbadah(customIbadah.filter((x) => x !== item));

      setIbadahActivities(
        ibadahActivities.filter((x) => x !== item)
      );
    } else {
      setCustomKesehatan(
        customKesehatan.filter((x) => x !== item)
      );

      setKesehatanActivities(
        kesehatanActivities.filter((x) => x !== item)
      );
    }
  };

  const moveActivity = (direction, index) => {
    const list =
      selectedMenu === 'ibadah'
        ? [...ibadahActivities]
        : [...kesehatanActivities];

    if (direction === 'up' && index > 0) {
      [list[index], list[index - 1]] = [
        list[index - 1],
        list[index],
      ];
    }

    if (
      direction === 'down' &&
      index < list.length - 1
    ) {
      [list[index], list[index + 1]] = [
        list[index + 1],
        list[index],
      ];
    }

    if (selectedMenu === 'ibadah') {
      setIbadahActivities(list);
    } else {
      setKesehatanActivities(list);
    }
  };

  const loadActivities = async () => {
    const querySnapshot = await getDocs(
      collection(db, "activities")
    );

    const ibadah = [];
    const kesehatan = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.category === 'ibadah') {
        ibadah.push(data.name);
      } else {
        kesehatan.push(data.name);
      }
    });

    setCustomIbadah(ibadah);
    setCustomKesehatan(kesehatan);
  };

  const toggleActivity = async (item) => {
    const today =
      new Date().toISOString().split('T')[0];

    if (completedActivities.includes(item)) {
      setCompletedActivities(
        completedActivities.filter((x) => x !== item)
      );

      const completedSnapshot = await getDocs(
        collection(db, "completed")
      );

      completedSnapshot.forEach(async (document) => {
        const data = document.data();

        if (
          data.name === item &&
          data.date === today
        ) {
          await deleteDoc(
            doc(db, "completed", document.id)
          );
        }
      });
    } else {
      setCompletedActivities([
        ...completedActivities,
        item,
      ]);

      await addDoc(
        collection(db, "completed"),
        {
          name: item,
          category:
            [...ibadahActivities, ...customIbadah].includes(
              item
            )
              ? 'ibadah'
              : 'kesehatan',
          date: today,
        }
      );
    }

    loadWeeklyMonthlyStats();
    loadCompletedActivities();
  };

  const loadHistoryData = async () => {
    const snapshot = await getDocs(
      collection(db, "completed")
    );

    const history = [];

    snapshot.forEach((doc) => {
      history.push(doc.data());
    });

    setHistoryData(history);
  };
  const loadWeeklyMonthlyStats = async () => {
    const completedRef = collection(
      db,
      "completed"
    );

    const snapshot = await getDocs(completedRef);

    let weeklyIbadah = 0;
    let weeklyKesehatan = 0;

    let monthlyIbadah = 0;
    let monthlyKesehatan = 0;

    const today = new Date();

    snapshot.forEach((doc) => {
      const data = doc.data();

      const itemDate = new Date(data.date);

      const diffTime =
        today.getTime() - itemDate.getTime();

      const diffDays = Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 7) {
        if (data.category === 'ibadah') {
          weeklyIbadah++;
        } else {
          weeklyKesehatan++;
        }
      }

      if (diffDays <= 30) {
        if (data.category === 'ibadah') {
          monthlyIbadah++;
        } else {
          monthlyKesehatan++;
        }
      }
    });

    setWeeklyStats({
      ibadahDone: weeklyIbadah,
      kesehatanDone: weeklyKesehatan,
    });

    setMonthlyStats({
      ibadahDone: monthlyIbadah,
      kesehatanDone: monthlyKesehatan,
    });
  };

  const loadCompletedActivities = async () => {
    const today =
      new Date().toISOString().split('T')[0];

    const querySnapshot = await getDocs(
      collection(db, "completed")
    );

    const completed = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.date === today) {
        completed.push(data.name);
      }
    });

    setCompletedActivities(completed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="bg-gradient-to-r from-green-700 to-emerald-500 rounded-[32px] p-6 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>

          <div className="relative z-10">
            <p className="text-sm opacity-90">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>

            <h1 className="text-4xl font-black leading-tight">
              {appTitle}
            </h1>

            <p className="text-sm mt-2 opacity-90">
              Teruslah berusaha menjadi pribadi yang lebih baik
            </p>

            <div className="mt-6 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress Hari Ini</span>
                <span>{totalPercent}%</span>
              </div>

              <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                <div className="bg-white h-3 rounded-full"
                  style={{ width: `${totalPercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between mt-3 text-sm">
                <span>  🔥 {totalCompleted} Aktivitas Selesai</span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-5">
            <button
              onClick={() => {
                setSelectedMenu('kesehatan');
                setActiveTab('activity');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-[28px] p-6 text-left shadow-xl hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-2xl">
                    Menu Kesehatan
                  </h2>

                  <p className="text-sm mt-2 opacity-90">
                    Workout, makan & target kesehatan
                  </p>
                </div>

                <div className="text-5xl">💪</div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedMenu('ibadah');
                setActiveTab('activity');
              }}
              className="w-full bg-gradient-to-r from-green-700 to-emerald-500 text-white rounded-[28px] p-6 text-left shadow-xl hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-2xl">
                    Menu Ibadah
                  </h2>

                  <p className="text-sm mt-2 opacity-90">
                    Sholat & habit islami
                  </p>
                </div>

                <div className="text-5xl">🕌</div>
              </div>
            </button>

            <div className="bg-white rounded-2xl p-4 shadow mt-4">
              <h2 className="font-bold text-lg mb-4">
                Statistik Bulanan 📊
              </h2>

              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-xl">
                  <p>Total Aktivitas</p>

                  <p className="font-bold text-lg">
                    {monthlyTotalActivities}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl">
                  <p>Dilakukan</p>

                  <p className="font-bold text-lg">
                    {monthlyStats.ibadahDone +
                      monthlyStats.kesehatanDone}
                  </p>
                </div>

                <div className="bg-red-50 p-3 rounded-xl">
                  <p>Tidak Dilakukan</p>

                  <p className="font-bold text-lg">
                    {monthlyTotalActivities -
                      (monthlyStats.ibadahDone +
                        monthlyStats.kesehatanDone)}
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-xl">
                  <p>Presentase</p>

                  <p className="font-bold text-lg">
                    {Math.round(
                      ((monthlyStats.ibadahDone +
                        monthlyStats.kesehatanDone) /
                        (monthlyTotalActivities || 1)) *
                      100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow mt-4">
          <h2 className="font-bold text-lg mb-3">
            AI Evaluasi Otomatis 🤖
          </h2>

          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-sm leading-relaxed">
              {leastConsistent
                ? `Kamu cukup konsisten dalam beberapa aktivitas, namun "${leastConsistent[0]}" masih jarang dilakukan. Cobalah lebih fokus dan konsisten agar perkembangan diri menjadi lebih baik setiap harinya.`
                : 'Belum ada data evaluasi.'}
            </p>
          </div>
        </div>

        {activeTab === 'activity' && (
          <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-800">
                  Daily Checklist
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Checklist aktivitas harian
                </p>
              </div>

              <div className="text-4xl">
                {selectedMenu === 'ibadah' ? '🕌' : '💪'}
              </div>
            </div>

            {currentActivities.map((item, index) => (
              <div
                key={index}
                className={`rounded-[24px] p-5 flex items-center justify-between border transition-all hover:shadow-lg ${completedActivities.includes(item)
                  ? 'bg-gradient-to-r from-green-100 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-r from-gray-50 to-white border-gray-100'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveActivity('up', index)}
                      className="w-7 h-7 rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-gray-200"
                    >
                      ▲
                    </button>

                    <button
                      onClick={() => moveActivity('down', index)}
                      className="w-7 h-7 rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-gray-200"
                    >
                      ▼
                    </button>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      {item}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Tap untuk selesai
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleActivity(item)}
                  className={`w-9 h-9 rounded-full border-[5px] shadow-md hover:scale-110 transition-all flex items-center justify-center text-white text-sm font-bold ${completedActivities.includes(item)
                    ? 'bg-green-500 border-green-100'
                    : 'bg-white border-gray-300'
                    }`}
                >
                  {completedActivities.includes(item) ? '✓' : ''}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'statistik' && (
          <div className="space-y-5">
            <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-800">
                    Statistik Harian
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Ringkasan aktivitas hari ini
                  </p>
                </div>

                <div className="text-4xl">☀️</div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title: 'Ibadah',
                    total: `${ibadahTotal} Aktivitas`,
                    done: `${ibadahDone} Aktivitas`,
                    notDone: `${ibadahNotDone} Aktivitas`,
                    value: `${ibadahPercent}%`,
                  },
                  {
                    title: 'Kesehatan',
                    total: `${kesehatanTotal} Aktivitas`,
                    done: `${kesehatanDone} Aktivitas`,
                    notDone: `${kesehatanNotDone} Aktivitas`,
                    value: `${kesehatanPercent}%`,
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.title}
                        </p>

                        <div className="space-y-2 mt-2 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Total Aktivitas
                            </span>
                            <span className="font-semibold text-gray-700">
                              {item.total}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Dilakukan
                            </span>
                            <span className="font-semibold text-green-600">
                              {item.done}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Tidak Dilakukan
                            </span>
                            <span className="font-semibold text-red-500">
                              {item.notDone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-green-700 font-bold">
                        {item.value}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full"
                        style={{ width: item.value }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-800">
                    Statistik Mingguan
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Konsistensi aktivitas selama 7 hari
                  </p>
                </div>

                <div className="text-4xl">📈</div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title: 'Ibadah',
                    total: `${ibadahTotal * 7} Aktivitas`,
                    done: `${weeklyStats.ibadahDone} Aktivitas`,
                    notDone: `${ibadahTotal * 7 -
                      weeklyStats.ibadahDone
                      } Aktivitas`,
                    value: `${Math.round(
                      (weeklyStats.ibadahDone /
                        (ibadahTotal * 7 || 1)) *
                      100
                    )}%`,
                  },
                  {
                    title: 'Kesehatan',
                    total: `${kesehatanTotal * 7} Aktivitas`,
                    done: `${weeklyStats.kesehatanDone} Aktivitas`,
                    notDone: `${kesehatanTotal * 7 -
                      weeklyStats.kesehatanDone
                      } Aktivitas`,
                    value: `${Math.round(
                      (weeklyStats.kesehatanDone /
                        (kesehatanTotal * 7 || 1)) *
                      100
                    )}%`,
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.title}
                        </p>

                        <div className="space-y-2 mt-2 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Total Aktivitas
                            </span>
                            <span className="font-semibold text-gray-700">
                              {item.total}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Dilakukan
                            </span>
                            <span className="font-semibold text-green-600">
                              {item.done}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Tidak Dilakukan
                            </span>
                            <span className="font-semibold text-red-500">
                              {item.notDone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-green-700 font-bold">
                        {item.value}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full"
                        style={{ width: item.value }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-800">
                    Statistik Bulanan
                  </h2>

                  <div className="bg-white rounded-2xl p-4 shadow mt-4">
                    <h2 className="font-bold text-lg mb-4">
                      AI Evaluasi Bulan Ini 🤖
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="bg-green-50 p-3 rounded-xl">
                        <p className="font-bold text-green-700">
                          🏆 Aktivitas Terbaik
                        </p>
                        <p>{aiResult.best}</p>
                      </div>

                      <div className="bg-red-50 p-3 rounded-xl">
                        <p className="font-bold text-red-700">
                          ⚠️ Perlu Ditingkatkan
                        </p>
                        <p>{aiResult.weak}</p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-xl">
                        <p className="font-bold text-blue-700">
                          💡 Saran Perbaikan
                        </p>
                        <p>{aiResult.advice}</p>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-xl">
                        <p className="font-bold text-yellow-700">
                          🎯 Target Bulan Depan
                        </p>
                        <p>{aiResult.target}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Ringkasan habit bulan ini ({daysInMonth} hari)
                  </p>
                </div>

                <div className="text-4xl">🗓️</div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title: 'Ibadah',
                    total: `${ibadahTotal * daysInMonth} Aktivitas`,
                    done: `${monthlyStats.ibadahDone} Aktivitas`,
                    notDone: `${ibadahTotal * daysInMonth -
                      monthlyStats.ibadahDone
                      } Aktivitas`,
                    value: `${Math.round(
                      (monthlyStats.ibadahDone /
                        (ibadahTotal * daysInMonth || 1)) *
                      100
                    )}%`,
                  },
                  {
                    title: 'Kesehatan',
                    total: `${kesehatanTotal * daysInMonth} Aktivitas`,
                    done: `${monthlyStats.kesehatanDone} Aktivitas`,
                    notDone: `${kesehatanTotal * daysInMonth -
                      monthlyStats.kesehatanDone
                      } Aktivitas`,
                    value: `${Math.round(
                      (monthlyStats.kesehatanDone /
                        (kesehatanTotal * daysInMonth || 1)) *
                      100
                    )}%`,
                  },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.title}
                        </p>

                        <div className="space-y-2 mt-2 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Total Aktivitas
                            </span>
                            <span className="font-semibold text-gray-700">
                              {item.total}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Dilakukan
                            </span>
                            <span className="font-semibold text-green-600">
                              {item.done}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">
                              Tidak Dilakukan
                            </span>
                            <span className="font-semibold text-red-500">
                              {item.notDone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-green-700 font-bold">
                        {item.value}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full"
                        style={{ width: item.value }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluasi' && (
          <div className="space-y-5">

            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-[32px] p-6 shadow-xl">
              <h2 className="text-3xl font-black">
                📋 Evaluasi Aktivitas
              </h2>

              <p className="mt-2 text-sm opacity-90">
                Monitoring dan evaluasi aktivitas bulanan
              </p>
            </div>

            <div className="mt-4">
              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(Number(e.target.value))
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  p-3
                  bg-white
                  text-gray-700
                  font-medium
                "
              >
                {monthNames.map((month, index) => (
                  <option
                    key={index}
                    value={index}
                  >
                    {month} {selectedYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[32px] p-4 shadow-xl">
              <div className="flex gap-2">

                <button
                  onClick={() =>
                    setEvaluationFilter("all")
                  }
                  className={`flex-1 rounded-2xl py-3 font-semibold ${evaluationFilter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                    }`}
                >
                  Semua
                </button>

                <button
                  onClick={() =>
                    setEvaluationFilter("ibadah")
                  }
                  className={`flex-1 rounded-2xl py-3 font-semibold ${evaluationFilter === "ibadah"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                    }`}
                >
                  Ibadah
                </button>

                <button
                  onClick={() =>
                    setEvaluationFilter("kesehatan")
                  }
                  className={`flex-1 rounded-2xl py-3 font-semibold ${evaluationFilter === "kesehatan"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                    }`}
                >
                  Kesehatan
                </button>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl p-4 shadow-lg">
                <p className="text-xs opacity-90">
                  🏆 Aktivitas Terbaik
                </p>

                <p className="font-bold text-lg mt-2">
                  {mostConsistent
                    ? mostConsistent[0]
                    : "-"}
                </p>

                <p className="text-sm opacity-90">
                  {mostConsistent
                    ? `${mostConsistent[1]}x`
                    : ""}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-4 shadow-lg mt-4">

                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    📊 Konsistensi Bulan Ini
                  </span>

                  <span className="font-bold text-green-600">
                    {Math.round(
                      (
                        (
                          monthlyStats.ibadahDone +
                          monthlyStats.kesehatanDone
                        ) /
                        (
                          monthlyTotalActivities || 1
                        )
                      ) * 100
                    )}
                    %
                  </span>
                </div>

                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                    style={{
                      width: `${Math.round(
                        (
                          (
                            monthlyStats.ibadahDone +
                            monthlyStats.kesehatanDone
                          ) /
                          (
                            monthlyTotalActivities || 1
                          )
                        ) * 100
                      )}%`
                    }}
                  />
                </div>

              </div>

              <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-3xl p-4 shadow-lg">
                <p className="text-xs opacity-90">
                  ⚠️ Perlu Ditingkatkan
                </p>

                <p className="font-bold text-lg mt-2">
                  {leastConsistent
                    ? leastConsistent[0]
                    : "-"}
                </p>

                <p className="text-sm opacity-90">
                  {leastConsistent
                    ? `${leastConsistent[1]}x`
                    : ""}
                </p>
              </div>

            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-xl">
              <p className="text-center text-gray-500">
                <div className="overflow-auto max-h-[70vh]">

                  <table className="min-w-full text-xs border-collapse">

                    <thead>

                      <tr>

                        <th
                          className="
                            sticky
                            top-0
                            left-0
                            z-30
                            bg-white
                            p-3
                            text-left
                            font-bold
                            border-b
                            shadow-sm
                          "
                        >
                          Aktivitas
                        </th>

                        {monthDays.map((day) => (
                          <th
                            key={day}
                            className="
                              sticky
                              top-0
                              z-10
                              bg-white
                              p-2
                              text-center
                              font-semibold
                              min-w-[36px]
                              border-b
                            "
                          >
                            {day}
                          </th>
                        ))}

                        <th className="p-3 text-center font-bold">
                          %
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredActivities.map((activity) => (

                        <tr
                          key={activity}
                          className="border-t hover:bg-slate-50"
                        >

                          <td
                            className="
                              sticky
                              left-0
                              z-20
                              bg-white
                              p-3
                              font-semibold
                              whitespace-nowrap
                              border-r
                              shadow-sm
                            "
                          >
                            {activity}
                          </td>

                          {monthDays.map((day) => (

                            <td
                              key={day}
                              className="text-center p-2"
                            >
                              {getActivityStatus(
                                activity,
                                day
                              ) === "done" ? (
                                <div className="w-5 h-5 mx-auto rounded bg-emerald-500"></div>
                              ) : getActivityStatus(
                                activity,
                                day
                              ) === "future" ? (
                                <div className="w-5 h-5 mx-auto rounded bg-slate-200"></div>
                              ) : (
                                <div className="w-5 h-5 mx-auto rounded bg-rose-500"></div>
                              )}
                            </td>

                          ))}

                          <td className="text-center font-bold text-slate-600">
                            <span
                              className={`font-bold ${getActivityPercentage(activity) >= 80
                                ? "text-green-600"
                                : getActivityPercentage(activity) >= 50
                                  ? "text-yellow-500"
                                  : "text-red-500"
                                }`}
                            >
                              {getActivityPercentage(activity)}%
                            </span>
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                  <div className="overflow-auto max-h-[70vh]">

                    <table>
                    </table>

                  </div>

                  {/* TEMPAT AI INSIGHT */}

                  <div className="bg-white rounded-[32px] p-6 shadow-xl mt-6">

                    <h2 className="text-xl font-bold mb-4">
                      🤖 AI Insight Bulan Ini
                    </h2>

                    <div className="space-y-3">

                      <div className="bg-blue-50 p-3 rounded-xl">
                        <p className="font-bold text-blue-700">
                          📈 Konsistensi Keseluruhan
                        </p>
                        <p>{Math.round(
                          (
                            (monthlyStats.ibadahDone +
                              monthlyStats.kesehatanDone) /
                            (monthlyTotalActivities || 1)
                          ) * 100
                        )}%</p>
                      </div>

                      <div className="bg-green-50 p-3 rounded-xl">
                        <p className="font-bold text-green-700">
                          🏆 Aktivitas Terbaik
                        </p>
                        <p>
                          {aiResult.best}
                        </p>
                      </div>

                      <div className="bg-red-50 p-3 rounded-xl">
                        <p className="font-bold text-red-700">
                          ⚠️ Aktivitas Terlemah
                        </p>
                        <p>
                          {aiResult.weak}
                        </p>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-xl">
                        <p className="font-bold text-yellow-700">
                          🎯 Target Bulan Depan
                        </p>
                        <p>
                          Tingkatkan konsistensi menjadi{" "}
                          {aiResult.target}
                        </p>
                      </div>

                      <div className="bg-white rounded-[32px] p-6 shadow-xl mt-6">

                        <h2 className="text-xl font-bold mb-4">
                          📈 Trend Konsistensi
                        </h2>

                        <div className="space-y-3">
                          {monthlyTrend.map((item) => (

                            <div key={item.month}>

                              <div className="flex justify-between mb-1">

                                <span>
                                  {monthNames[item.month]}
                                </span>

                                <span className="font-bold">
                                  {item.percentage}%
                                </span>

                              </div>

                              <div className="w-full h-3 bg-gray-200 rounded-full">

                                <div
                                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                                  style={{
                                    width: `${item.percentage}%`
                                  }}
                                />

                              </div>

                            </div>

                          ))}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              </p>
            </div>

          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-800">
                    Kelola Aktivitas
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    Kelola checklist custom sesuai kebutuhan
                  </p>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-purple-100 shadow-lg flex items-center justify-center text-4xl">
                  ⚙️
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-[28px] p-5 shadow-lg mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 rounded-[24px] bg-white shadow-md flex items-center justify-center text-5xl">
                    ✏️
                  </div>

                  <div className="border-l border-yellow-200 pl-4">
                    <h3 className="text-2xl font-black text-gray-800">
                      Custom Judul Home
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      Ganti tulisan utama pada menu Home
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Daily Muslim Tracker"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-4 bg-white outline-none"
                  />

                  <button
                    onClick={saveTitle}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl py-4 font-bold shadow-lg"
                  >
                    Simpan Judul
                  </button>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-[28px] p-5 shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-24 h-24 rounded-[24px] bg-white shadow-md flex items-center justify-center text-5xl">
                        ➕
                      </div>

                      <div className="border-l border-green-200 pl-4">
                        <h3 className="text-2xl font-black text-gray-800">
                          Tambahkan Aktivitas
                        </h3>

                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          Buat checklist custom baru sesuai kebutuhan Anda
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <input
                      type="text"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Contoh: Push Up"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-4 bg-white outline-none"
                    />

                    <select
                      value={activityCategory}
                      onChange={(e) => setActivityCategory(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-4 bg-white outline-none"
                    >
                      <option value="ibadah">Menu Ibadah</option>
                      <option value="kesehatan">Menu Kesehatan</option>
                    </select>

                    <button
                      onClick={addActivity}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl py-4 font-bold shadow-lg"
                    >
                      Simpan Aktivitas
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 rounded-[28px] p-5 shadow-lg">
                  <h3 className="text-2xl font-black text-gray-800 mb-4">
                    Hapus Aktivitas
                  </h3>

                  <select
                    value={deleteCategory}
                    onChange={(e) => setDeleteCategory(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-4 bg-white outline-none mb-4"
                  >
                    <option value="ibadah">Menu Ibadah</option>
                    <option value="kesehatan">Menu Kesehatan</option>
                  </select>

                  <div className="space-y-3">
                    {(deleteCategory === 'ibadah'
                      ? [...ibadahActivities, ...customIbadah]
                      : [...kesehatanActivities, ...customKesehatan]
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl p-4 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800">
                          {item}
                        </span>

                        <button
                          onClick={() =>
                            deleteActivity(deleteCategory, item)
                          }
                          className="text-red-500 text-xl"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}

                    {((deleteCategory === 'ibadah'
                      ? [...ibadahActivities, ...customIbadah].length
                      : [...kesehatanActivities, ...customKesehatan].length) === 0) && (
                        <div className="bg-white rounded-2xl p-5 text-center text-gray-400 text-sm">
                          Belum ada aktivitas custom
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="max-w-md mx-auto bg-white rounded-[28px] shadow-2xl border border-gray-100 px-6 py-4 flex justify-around items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center text-xs transition-all ${activeTab === 'home'
              ? 'text-green-700 scale-105 font-bold'
              : 'text-gray-500'
              }`}
          >
            <span className="text-2xl">🏠</span>
            Home
          </button>

          <button
            onClick={() => setActiveTab('statistik')}
            className={`flex flex-col items-center text-xs transition-all ${activeTab === 'statistik'
              ? 'text-green-700 scale-105 font-bold'
              : 'text-gray-500'
              }`}
          >
            <span className="text-2xl">📈</span>
            Statistik
          </button>

          <button
            onClick={() => setActiveTab('evaluasi')}
            className={`flex flex-col items-center text-xs transition-all ${activeTab === 'evaluasi'
              ? 'text-green-700 scale-105 font-bold'
              : 'text-gray-500'
              }`}
          >
            <span className="text-2xl">📋</span>
            Evaluasi
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center text-xs transition-all ${activeTab === 'profile'
              ? 'text-green-700 scale-105 font-bold'
              : 'text-gray-500'
              }`}
          >
            <span className="text-2xl">👤</span>
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}
