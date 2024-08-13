export function x(results, settings) {
    return {
        color: 'black',
        callback: function(value, index, values) {
            const label = results[value].text;            
            const pxPerAnswer = settings.barChartWidth / results.length;
            const pxPerLetter = 10;
            const lettersPerAnswer = Math.floor(pxPerAnswer / pxPerLetter);
            const labelArray = splitStringByWords(label, lettersPerAnswer);
            
            if(labelArray.length > 3) labelArray[2] += '...';
            
            return labelArray.slice(0, 3);
        }
    }
}

export function regular(results, questionSettings) {
    return {
        color: "#000",
        stepSize: (results.respondentCount / 5).toFixed(),
        callback: (value, index, ticks) => {
            if(questionSettings.dataType === "numbers") {
                return value.toFixed();
            } else {
                const maxYValue = ticks[ticks.length - 1].value;

                if(value === 0) return '0%';

                const tickPercentage = (value / maxYValue) * 100;

                return tickPercentage.toFixed() + '%';
            }
        }
    }
}

function splitStringByWords(str, length) {
    const words = str.split(' ');
    const result = [];
    let tempStr = '';

    for (let word of words) {
        if ((tempStr + ' ' + word).trim().length <= length) {
            tempStr = (tempStr + ' ' + word).trim();
        } else {
            if (tempStr.length > 0) {
                result.push(tempStr);
            }
            if (word.length > length) {
                while (word.length > length) {
                    result.push(word.slice(0, length));
                    word = word.slice(length);
                }
            }
            tempStr = word;
        }
    }

    if (tempStr) {
        result.push(tempStr);
    }

    return result;
}