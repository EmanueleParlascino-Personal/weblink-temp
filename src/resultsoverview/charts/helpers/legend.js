// Return the answers that are currently turned on in the legend
export function visibleAnswers(chart, results){
    if(chart === undefined) return results;
    
    // Make a copy of the results object as we don't want to edit the original object
    let resultsClone = structuredClone(results);

    resultsClone.answerResults = resultsClone.answerResults.filter((answer, answerIndex) => {
        return chart.getDataVisibility(answerIndex)
    });

    return resultsClone;
}