/**
 * A simple bar chart of reviews completed per day over the last 7 days.
 * Built with plain CSS bars rather than a charting library — the data
 * is small and the shape is simple, so a dependency isn't justified.
 *
 * `days` shape: [{ date, label, count }, ...] (oldest to newest), from
 * utils/storage.getWeeklyReviewCounts().
 */
function WeeklyProgressChart({ days }) {
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const totalThisWeek = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="weekly-chart-card">
      <div className="weekly-chart-header">
        <h2>Weekly Progress</h2>
        <span className="weekly-chart-total">
          {totalThisWeek} review{totalThisWeek === 1 ? "" : "s"} this week
        </span>
      </div>

      <div className="weekly-chart-bars">
        {days.map((day) => {
          const heightPercent = Math.max(4, (day.count / maxCount) * 100);
          const isToday = day.date === new Date().toISOString().slice(0, 10);

          return (
            <div className="weekly-chart-col" key={day.date}>
              <span className="weekly-chart-count">{day.count > 0 ? day.count : ""}</span>
              <div className="weekly-chart-track">
                <div
                  className={"weekly-chart-bar" + (isToday ? " today" : "")}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className={"weekly-chart-label" + (isToday ? " today" : "")}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyProgressChart;
