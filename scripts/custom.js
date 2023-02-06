(function() {
    // Enable Bootstrap tooltips
    Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
})();
(function() {
    document.querySelectorAll('[data-chart-data-type=status]').forEach(function(el) {

        const colors = JSON.parse(el.dataset.chartColors);
        const categories = JSON.parse(el.dataset.chartLabels);
        const data = JSON.parse(el.dataset.chartData);

        const options = {
            labels: categories,
            colors: colors,
            series: data,
            chart: {
                type: 'donut',
                height: 350,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " requests"
                    }
                }
            },
            fill: {
                opacity: 1
            }
        };
        var chart = new ApexCharts(el, options);
        chart.render();
    });
    document.querySelectorAll('[data-chart-data-type=requests]').forEach(function(el) {

        const colors = JSON.parse(el.dataset.chartColors);
        const categories = JSON.parse(el.dataset.chartLabels);
        const data = JSON.parse(el.dataset.chartData);
        
        const options = {
            series: data,
            labels: categories,
            colors: colors,
            chart: {
                type: 'bar',
                height: 50+categories.length*30,
                stacked: true,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                },
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " requests"
                    }
                }
            },
            fill: {
                opacity: 1
            }
        };
        var chart = new ApexCharts(el, options);
        chart.render();
    });
})();