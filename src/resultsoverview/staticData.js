export default function () {
    const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-color');
    const allowedGraphTypes = {
        basic: ['pieChart', 'polarChart', 'donutChart', 'stackedBarChart', 'horizontalBarChart', 'verticalBarChart', 'tableView'],
        all: ['pieChart', 'polarChart', 'donutChart', 'stackedBarChart', 'horizontalBarChart', 'verticalBarChart', 'lineChart', 'tableView'],
        swipe: ['swipe', 'pieChart', 'polarChart', 'donutChart', 'stackedBarChart', 'horizontalBarChart', 'verticalBarChart', 'lineChart', 'tableView'],
        draganddrop: ['verticalStackedBarChart', 'verticalBarChart', 'horizontalBarChart', 'lineChart', 'donutChart', 'tableView'],
        verticalBars: ['horizontalBarChart', 'verticalBarChart', 'tableView'],
        rating: ['rating'],
        camera: ['camera'],
        none: []
    };

    return {
        questionType: {
            empty: {
                allowedGraphList: allowedGraphTypes.none,
                chartBasic: 'respondentCount',
                hasCrosstable: false,
                hasSettingsButton: false,
            },
            commerce: {
                allowedGraphList: allowedGraphTypes.none,
                chartBasic: 'multiAnswerList',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            redirect: {
                allowedGraphList: allowedGraphTypes.none,
                chartBasic: 'respondentCount',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            tagit: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'hotspot',
                hasCrosstable: false,
                hasSettingsButton: false,
            },
            pointdistribution: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            kvk: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'multiAnswerList',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            fileupload: {
                allowedGraphList: allowedGraphTypes.camera,
                hasQuestionSettings: false,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: false,
                hasSettingsButton: false,
            },
            slider: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'slider',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            ranking: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'ranking',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            open: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'answerList',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            memo: { 
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'answerList',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            fields: {
                allowedGraphList: allowedGraphTypes.none,
                hasQuestionSettings: false,
                chartBasic: 'multiAnswerList',
                hasCrosstable: false,
                hasSettingsButton: false,
            },
            swipe: { 
                allowedGraphList: allowedGraphTypes.swipe,
                hasQuestionSettings: true,
                chartBasic: 'swipe',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            imagesingle: {
                allowedGraphList: allowedGraphTypes.basic,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            imagemulti: {
                allowedGraphList: allowedGraphTypes.verticalBars,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: false,
            },
            rating: {
                allowedGraphList: allowedGraphTypes.rating,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            semanticdifferential: {
                allowedGraphList: allowedGraphTypes.basic,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            draganddrop: {
                allowedGraphList: allowedGraphTypes.draganddrop,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            multi: {
                allowedGraphList: allowedGraphTypes.verticalBars,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            single: {
                allowedGraphList: allowedGraphTypes.all,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            tablesingle: {
                allowedGraphList: allowedGraphTypes.all,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            tablemulti: {
                allowedGraphList: allowedGraphTypes.verticalBars,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            tablemixed: {
                allowedGraphList: allowedGraphTypes.verticalBars,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            },
            selectbox: {
                allowedGraphList: allowedGraphTypes.all,
                hasQuestionSettings: true,
                chartBasic: 'horizontalBarChart',
                hasCrosstable: true,
                hasSettingsButton: true,
            }
        },
        charts: {
            horizontalBarChart: {
                icon: 'fa-solid fa-chart-simple-horizontal',
                hasLegend: false,
                hasAnswerOrderSetting: true,
                hasLabelSetting: false,
                hasDatatypeSetting: true,
            },
            rating: {
                icon: 'fa-solid fa-chart-simple-horizontal',
                hasLegend: false,
                hasAnswerOrderSetting: true,
                hasLabelSetting: false,
                hasDatatypeSetting: true,
            },
            verticalBarChart: {
                icon: 'fa-sharp fa-solid fa-chart-simple',
                hasLegend: true,
                hasAnswerOrderSetting: true,
                hasLabelSetting: true,
                hasDatatypeSetting: true,
            },
            pieChart: {
                icon: 'fa-solid fa-chart-pie-simple',
                hasLegend: true,
                hasAnswerOrderSetting: true,
                hasLabelSetting: false,
                hasDatatypeSetting: true,
            },
            polarChart: {
                icon: 'fa-sharp fa-solid fa-chart-radar',
                hasLegend: true,
                hasAnswerOrderSetting: false,
                hasLabelSetting: false,
                hasDatatypeSetting: true,
            },
            donutChart: {
                icon: 'fa-solid fa-circle-dot',
                hasLegend: true,
                hasAnswerOrderSetting: true,
                hasLabelSetting: false,
                hasDatatypeSetting: true,
            },
            lineChart: {
                icon: 'fa-solid fa-chart-line',
                hasLegend: true,
                hasAnswerOrderSetting: true,
                hasLabelSetting: true,
                hasDatatypeSetting: false,
            },
            verticalStackedBarChart: {
                icon: 'fa-solid fa-chart-waterfall'
            },
            stackedBarChart: {
                icon: 'fa-sharp fa-solid fa-bars-progress',
                hasLegend: true,
                hasAnswerOrderSetting: true,
                hasLabelSetting: true,
                hasDatatypeSetting: true,
            },
            respondentCount: {
                icon: 'fa-solid fa-file-circle-plus'
            },
            hotspot: {
                icon: 'fa-solid fa-grip-dots'
            },
            multiAnswerList: {
                icon: 'fa-solid fa-input-text'
            },
            rating: {
                icon: 'fa-open fa-star'
            },
            ranking: {
                icon: 'fa-solid fa-list-ol'
            },
            answerList: {
                icon: 'fa-solid fa-input-text'
            },
            swipe: {
                icon: 'fa-solid fa-angles-right'
            },
            tableView: {
                icon: 'fa-solid fa-table',
                hasAnswerOrderSetting: true,
            },
            camera: {
                icon: 'fa-solid fa-table',
                hasAnswerOrderSetting: true,
            }
        },
        borderColor: [brandColor],
        fontSize: 14,
        brandColor,
        fontWeight: 'bold',
        fontColor: 'white',
        scrollTreshold: 200,
        barChartWidth: 700,
        largeBarChartWidth: 1000,
        regularChartWidth: 400,
        pxPerLetterInLabel: 10,
        loadOpenAnswerAmt: 2000
    }
}