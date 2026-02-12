const calculateDailyTarget = (plan, date) => {
    if (!plan || !plan.startDate || !plan.targetQuitDate) return plan.initialDailyAverage;

    const start = new Date(plan.startDate).getTime();
    const end = new Date(plan.targetQuitDate).getTime();
    const current = new Date(date).getTime();

    if (isNaN(start) || isNaN(end) || isNaN(current)) {
        return plan.initialDailyAverage;
    }

    if (current < start) return plan.initialDailyAverage;
    if (current >= end) return 0;

    const totalDuration = end - start;
    const elapsed = current - start;
    const progress = elapsed / totalDuration;

    // Linear reduction for now, can be improved to exponential or stepped
    const target = Math.ceil(plan.initialDailyAverage * (1 - progress));
    return Math.max(0, target);
};

const calculateReductionSchedule = (plan) => {
    const schedule = [];
    let currentDate = new Date(plan.startDate);
    const endDate = new Date(plan.targetQuitDate);

    while (currentDate <= endDate) {
        schedule.push({
            date: new Date(currentDate),
            target: calculateDailyTarget(plan, currentDate)
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedule;
};

module.exports = {
    calculateDailyTarget,
    calculateReductionSchedule
};
