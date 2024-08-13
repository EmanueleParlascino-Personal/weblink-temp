export function cutOffLabel(label, amtLettersPerLabel) {
    const labelIsLargerThanWidth = label.length > amtLettersPerLabel;

    if(labelIsLargerThanWidth === true) {
        return label.substring(0, amtLettersPerLabel - 3) + '...';
    }

    return label;
}

export function calcAmtLettersPerLabel(results, settings) { 
    const resultsAmt = results.length;

    if(resultsAmt === 0) return 0;

    const pxPerBar = settings.barChartWidth / resultsAmt;
    const amtLettersPerLabel = pxPerBar / settings.pxPerLetterInLabel;

    return Math.floor(amtLettersPerLabel);
}

export function formatPercentageForDisplay(percentage, culture) {
    if (percentage > 99 && percentage < 100) {
        return (parseFloat(percentage.toFixed(2))).toLocaleString(culture) + '%';
    } else if (percentage < 0.1 && percentage != 0) {
        return '<' + (0.1).toLocaleString(culture) + '%';
    } else if (percentage > 0.1 && percentage < 1) {
        return (parseFloat(percentage.toFixed(1))).toLocaleString(culture) + '%';
    } else {
        return Math.round(percentage) + '%';
    }
}