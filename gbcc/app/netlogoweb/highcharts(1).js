(function() {
  var PenBundle, PlotOps;

  PenBundle = tortoise_require('engine/plot/pen');

  PlotOps = tortoise_require('engine/plot/plotops');

  window.HighchartsOps = (function() {
    class HighchartsOps extends PlotOps {
      constructor(elemID) {
        var addPoint, registerPen, reset, resetPen, resize, thisOps, updatePenColor, updatePenMode;
        resize = function(xMin, xMax, yMin, yMax) {
          this._chart.xAxis[0].setExtremes(xMin, xMax);
          this._chart.yAxis[0].setExtremes(yMin, yMax);
        };
        reset = function(plot) {
          this._chart.destroy();
          this._chart = new Highcharts.Chart({
            chart: {
              animation: false,
              renderTo: elemID,
              spacingBottom: 10,
              spacingLeft: 15,
              spacingRight: 15,
              zoomType: "xy"
            },
            credits: {
              enabled: false
            },
            legend: {
              enabled: plot.isLegendEnabled,
              margin: 5,
              itemStyle: {
                fontSize: "10px"
              }
            },
            series: [],
            title: {
              text: plot.name,
              style: {
                fontSize: "12px"
              }
            },
            exporting: {
              buttons: {
                contextButton: {
                  height: 10,
                  symbolSize: 10,
                  symbolStrokeWidth: 1,
                  symbolY: 5
                }
              }
            },
            tooltip: {
              formatter: function() {
                var x, y;
                x = Number(Highcharts.numberFormat(this.point.x, 2, '.', ''));
                y = Number(Highcharts.numberFormat(this.point.y, 2, '.', ''));
                return `<span style='color:${this.series.color}'>${this.series.name}</span>: <b>${x}, ${y}</b><br/>`;
              }
            },
            xAxis: {
              title: {
                text: plot.xLabel,
                style: {
                  fontSize: '10px'
                }
              },
              labels: {
                style: {
                  fontSize: '9px'
                }
              }
            },
            yAxis: {
              title: {
                text: plot.yLabel,
                x: -7,
                style: {
                  fontSize: '10px'
                }
              },
              labels: {
                padding: 0,
                x: -15,
                style: {
                  fontSize: '9px'
                }
              }
            },
            plotOptions: {
              series: {
                turboThreshold: 1
              },
              column: {
                pointPadding: 0,
                pointWidth: 8,
                borderWidth: 1,
                groupPadding: 0,
                shadow: false,
                grouping: false
              }
            }
          });
          this._penNameToSeriesNum = {};
        };
        registerPen = function(pen) {
          var num, options, series, type;
          num = this._chart.series.length;
          series = this._chart.addSeries({
            color: this.colorToRGBString(pen.getColor()),
            data: [],
            dataLabels: {
              enabled: false
            },
            name: pen.name
          });
          type = this.modeToString(pen.getDisplayMode());
          options = thisOps.seriesTypeOptions(type);
          series.update(options);
          this._penNameToSeriesNum[pen.name] = num;
        };
        // This is a workaround for a bug in CS2 `@` detection: https://github.com/jashkenas/coffeescript/issues/5111
        // -JMB December 2018
        thisOps = null;
        resetPen = (pen) => {
          return () => {
            var ref;
            if ((ref = thisOps.penToSeries(pen)) != null) {
              ref.setData([]);
            }
          };
        };
        addPoint = (pen) => {
          return (x, y) => {
            // Wrong, and disabled for performance reasons --JAB (10/19/14)
            // color = @colorToRGBString(pen.getColor())
            // @penToSeries(pen).addPoint({ marker: { fillColor: color }, x: x, y: y })
            thisOps.penToSeries(pen).addPoint([x, y], false);
          };
        };
        updatePenMode = (pen) => {
          return (mode) => {
            var options, series, type;
            series = thisOps.penToSeries(pen);
            if (series != null) {
              type = thisOps.modeToString(mode);
              options = thisOps.seriesTypeOptions(type);
              series.update(options);
            }
          };
        };
        // Why doesn't the color change show up when I call `update` directly with a new color
        // (like I can with a type in `updatePenMode`)?
        // Send me an e-mail if you know why I can't do that.
        // Leave a comment on this webzone if you know why I can't do that. --JAB (6/2/15)
        updatePenColor = (pen) => {
          return (color) => {
            var hcColor, series;
            hcColor = thisOps.colorToRGBString(color);
            series = thisOps.penToSeries(pen);
            series.options.color = hcColor;
            series.update(series.options);
          };
        };
        super(resize, reset, registerPen, resetPen, addPoint, updatePenMode, updatePenColor);
        thisOps = this;
        this._chart = Highcharts.chart(elemID, {});
        this._penNameToSeriesNum = {};
        //These pops remove the two redundant functions from the export-csv plugin
        //see https://github.com/highcharts/export-csv and
        //https://github.com/NetLogo/Galapagos/pull/364#discussion_r108308828 for more info
        //--Camden Clark (3/27/17)
        //I heard you like hacks, so I put hacks in your hacks.
        //Highcharts uses the same menuItems for all charts, so we have to apply the hack once. - JMB November 2017
        if (this._chart.options.exporting.buttons.contextButton.menuItems.popped == null) {
          this._chart.options.exporting.buttons.contextButton.menuItems.pop();
          this._chart.options.exporting.buttons.contextButton.menuItems.pop();
          this._chart.options.exporting.buttons.contextButton.menuItems.popped = true;
        }
      }

      // (PenBundle.DisplayMode) => String
      modeToString(mode) {
        var Bar, Line, Point;
        ({Bar, Line, Point} = PenBundle.DisplayMode);
        switch (mode) {
          case Bar:
            return 'column';
          case Line:
            return 'line';
          case Point:
            return 'scatter';
          default:
            return 'line';
        }
      }

      // (String) => Highcharts.Options
      seriesTypeOptions(type) {
        var isLine, isScatter;
        isScatter = type === 'scatter';
        isLine = type === 'line';
        return {
          marker: {
            enabled: isScatter,
            radius: isScatter ? 1 : 4
          },
          lineWidth: isLine ? 2 : null,
          type: isLine ? 'scatter' : type
        };
      }

      // (PenBundle.Pen) => Highcharts.Series
      penToSeries(pen) {
        return this._chart.series[this._penNameToSeriesNum[pen.name]];
      }

      redraw() {
        return this._chart.redraw();
      }

      resizeElem(x, y) {
        return this._chart.setSize(x, y, false);
      }

    };

    HighchartsOps.prototype._chart = void 0; // Highcharts.Chart

    HighchartsOps.prototype._penNameToSeriesNum = void 0; // Object[String, Number]

    return HighchartsOps;

  }).call(this);

}).call(this);

//# sourceMappingURL=highcharts.js.map
