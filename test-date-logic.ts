function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

const startDate = "2025-01-02";
const endDateYahoo = "2025-11-22"; // Friday
const today = "2025-11-24"; // Sunday

console.log(`Yahoo End Date: ${endDateYahoo}`);
console.log(`Today: ${today}`);

let endDate = endDateYahoo;

if (new Date(today) > new Date(endDate)) {
  console.log(`Extending endDate to ${today}`);
  endDate = today;
} else {
  console.log("Not extending");
}

const dates = generateDateRange(startDate, endDate);
console.log(`Last 5 dates: ${dates.slice(-5).join(", ")}`);
