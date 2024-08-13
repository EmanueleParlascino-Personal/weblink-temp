import { formatPercentageForDisplay } from "./text";

export function regular(answers, brandColors, showAsPercentage = false) {
    let totalAnswers = answers.map(row => row.respondentCount).reduce((x, respondentCount) => x + respondentCount);
    return {
        labels: answers.map(row => row.text),
        datasets: [
            {
                barPercentage: 0.9, 
                categoryPercentage: 1,  
                backgroundColor: brandColors,
                data: answers.map(row => row.respondentCount),
                tooltipData: answers.map(row => showAsPercentage ? formatPercentageForDisplay((row.respondentCount / totalAnswers) * 100) : row.respondentCount) 
            }
        ]
    }
}

export function regularLine(answers, brandColors) {
   return {
        labels: answers.map(row => row.text),
        datasets: [
            {
                backgroundColor: brandColors,
                data: answers.map(row => row.respondentCount),
                pointStyle: 'circle',
                pointRadius: 5,
                pointHoverRadius: 15,
                segment: {
                    borderColor: (ctx) => {
                        return brandColors[ctx.p1.$context.dataIndex - 1]
                    }
                }
            }
        ]
    }
}