import { formatPercentageForDisplay } from "./text"

export function offset(results){
    return function (obj) {
        const answerAmt = obj.dataset.data[obj.dataIndex];
        const answeredPercentage = (answerAmt / results.respondentCount) * 100;
        if (answeredPercentage < 5) {
            return (answeredPercentage * 5) + 4;
        } else {
            return 4;
        }
    }
}

export function fontColor(results, isPercentageData, settings) {
    return function (obj) {
        const answerAmt = obj.dataset.data[obj.dataIndex];
        if(isPercentageData === true) {
            const answeredPercentage = (answerAmt / results.respondentCount) * 100;
    
            if (answeredPercentage < 5) {
                return '#000';
            } else {
                return settings.fontColor;
            }
        }
        else {
            if (answerAmt === 0) {
                return '#000';
            } else {
                return settings.fontColor;
            }
        }
    }
}

export function datalabelFormatter(results, showAsPercentage, hideLowPercentages, culture) {
    const isMultiResponse =
        (results.questionType === 'multi'
            || results.questionType === 'tablemulti'
            || results.questionType === 'tablemixed'
            || results.questionType === 'imagemulti'
            || results.questionType === 'draganddrop');
    const answers = results.subQuestionResults ?? results.answerResults;

    // If MR, don't recalculate results to ensure percentages total to 100
    const totalRespondents = isMultiResponse ? 
        results.respondentCount :
        answers.reduce((acc, curr) => acc + curr.respondentCount, 0);

    return function (answerAmt) {
        const answeredPercentage = (answerAmt / totalRespondents) * 100;
            
        if(isNaN(answeredPercentage)) return '';
        if(hideLowPercentages === true && answeredPercentage < 4) return '';

        if (showAsPercentage) {
            return formatPercentageForDisplay(answeredPercentage, culture);
        } else {
            return parseFloat(answerAmt.toFixed(2)).toLocaleString(culture);
        }
    }
}

export function datalabelFormatterLessThanOnePercent(results) {
    return function (answerAmt) {
        const totalRespondents = results.reduce((acc, curr) => acc + curr.respondentCount, 0);
        const isLessThanOnePercent = answerAmt < (0.01 * totalRespondents);

        return isLessThanOnePercent ? null : answerAmt.toLocaleString(culture);
    }
}