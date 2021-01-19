import React from 'react';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

export class Chart extends React.Component {

    componentDidMount() {
        this.initChart([]);
    }

    initChart(data) {
        let chart = am4core.create("chartdiv", am4charts.XYChart);

        chart.paddingRight = 20;

        chart.data = data;

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;

        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "value";

        series.tooltipText = "{valueY.value}";
        chart.cursor = new am4charts.XYCursor();

        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(series);
        chart.scrollbarX = scrollbarX;

        this.chart = chart;
    }

    buildData(history) {
        const result = [];
        for (let index = history.length - 1; index >= 0; index--) {
            const element = history[index];
            result.push({
                date: new Date(element.date),
                value: element.volume
            })
        }

        return result;
    }

    componentDidUpdate(oldProps) {
        if (oldProps.selectedItemHistory?.length !== this.props.selectedItemHistory?.length && this.props.selectedItemHistory?.length > 0) {
            this.chart.data = this.buildData(this.props.selectedItemHistory);
        }
    }

    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }


    render() {
        return (
            <div id="chartdiv" style={{ width: "100%", height: "400px" }}></div>
        );
    }

}