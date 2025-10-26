export function createReportsHelpers({ cards, chartPeriod }) {
  const getChartData = (cardData = null) => {
    const now = new Date();
    const periods = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      biannual: 180
    };

    const days = periods[chartPeriod];
    const values = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      let total = 0;
      const cardsToProcess = cardData ? [cardData] : cards;

      cardsToProcess.forEach(card => {
        card.entries.forEach(entry => {
          const entryDate = new Date(entry.date);
          if (entryDate.toDateString() === date.toDateString()) {
            total += entry.value;
          }
        });
      });

      values.push(total);
    }

    return values;
  };

  return { getChartData };
}
