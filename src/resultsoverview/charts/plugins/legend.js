import * as text from './../helpers/text';

// based(but heavily edited) on the chart.js official documentation
export const plugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        const div = getOrCreateLegendList(chart, options.containerID);
        
        // Remove old legend items
        while (div.firstChild) {
            div.firstChild.remove();
        }

        if(options.showLegenda === false) return

        const items = chart.options.plugins.legend.labels.generateLabels(chart);
        
        items.forEach(item => {
            const button = document.createElement('button');

            button.onclick = () => {
                const {type} = chart.config;

                if (type === 'bar' || type === 'pie' || type === 'doughnut' || type === 'polarArea') {
                    // Some charts only have a single dataset and visibility is per item
                    chart.toggleDataVisibility(item.index);
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                } else {
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                }      
                
                chart.update();
            };
    
            const boxSpan = document.createElement('span');
            boxSpan.style.background = item.fillStyle;
            boxSpan.style.borderColor = item.strokeStyle;
            boxSpan.style.borderWidth = item.lineWidth + 'px';
    
            const textContainer = document.createElement('p');
            textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
    
            const cuttOffLabelText = text.cutOffLabel(item.text, 75);
            const label = document.createTextNode(cuttOffLabelText);
            
            textContainer.appendChild(label);
    
            button.appendChild(boxSpan);
            button.appendChild(textContainer);
            div.appendChild(button);

            button.addEventListener('click', () => {
                if(chart.options.plugins.htmlLegend.callback) {
                    chart.options.plugins.htmlLegend.callback(chart)
                }
            });
        });
    }
};

// Based(but edited) on the official chart.js documentation
const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('div');
    
    if (!listContainer) {
        listContainer = document.createElement('div');
        legendContainer.appendChild(listContainer);
    }
  
    return listContainer;
};