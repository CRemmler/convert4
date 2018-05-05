(function() {
  var PenBundle, PlotOps,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  PenBundle = tortoise_require('engine/plot/pen');

  PlotOps = tortoise_require('engine/plot/plotops');

  window.HighchartsOps = (function(superClass) {
    extend(HighchartsOps, superClass);

    HighchartsOps.prototype._chart = void 0;

    HighchartsOps.prototype._penNameToSeriesNum = void 0;

    function HighchartsOps(elemID) {
      var addPoint, registerPen, reset, resetPen, resize, updatePenColor, updatePenMode;
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
              return "<span style='color:" + this.series.color + "'>" + this.series.name + "</span>: <b>" + x + ", " + y + "</b><br/>";
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
        var isScatter, mode, num;
        num = this._chart.series.length;
        mode = this.modeToString(pen.getDisplayMode());
        isScatter = mode === 'scatter';
        this._chart.addSeries({
          color: this.colorToRGBString(pen.getColor()),
          data: [],
          dataLabels: {
            enabled: false
          },
          marker: {
            enabled: isScatter,
            radius: isScatter ? 1 : 4
          },
          name: pen.name,
          type: mode
        });
        this._penNameToSeriesNum[pen.name] = num;
      };
      resetPen = (function(_this) {
        return function(pen) {
          return function() {
            var ref;
            if ((ref = _this.penToSeries(pen)) != null) {
              ref.setData([]);
            }
          };
        };
      })(this);
      addPoint = (function(_this) {
        return function(pen) {
          return function(x, y) {
            _this.penToSeries(pen).addPoint([x, y], false);
          };
        };
      })(this);
      updatePenMode = (function(_this) {
        return function(pen) {
          return function(mode) {
            var ref, type;
            type = _this.modeToString(mode);
            if ((ref = _this.penToSeries(pen)) != null) {
              ref.update({
                type: type
              });
            }
          };
        };
      })(this);
      updatePenColor = (function(_this) {
        return function(pen) {
          return function(color) {
            var hcColor, series;
            hcColor = _this.colorToRGBString(color);
            series = _this.penToSeries(pen);
            series.options.color = hcColor;
            series.update(series.options);
          };
        };
      })(this);
      HighchartsOps.__super__.constructor.call(this, resize, reset, registerPen, resetPen, addPoint, updatePenMode, updatePenColor);
      this._chart = Highcharts.chart(elemID, {});
      this._penNameToSeriesNum = {};
      if (this._chart.options.exporting.buttons.contextButton.menuItems.popped == null) {
        this._chart.options.exporting.buttons.contextButton.menuItems.pop();
        this._chart.options.exporting.buttons.contextButton.menuItems.pop();
        this._chart.options.exporting.buttons.contextButton.menuItems.popped = true;
      }
    }

    HighchartsOps.prototype.modeToString = function(mode) {
      var Bar, Line, Point, ref;
      ref = PenBundle.DisplayMode, Bar = ref.Bar, Line = ref.Line, Point = ref.Point;
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
    };

    HighchartsOps.prototype.penToSeries = function(pen) {
      return this._chart.series[this._penNameToSeriesNum[pen.name]];
    };

    HighchartsOps.prototype.redraw = function() {
      return this._chart.redraw();
    };

    HighchartsOps.prototype.resizeElem = function(x, y) {
      return this._chart.setSize(x, y, false);
    };

    return HighchartsOps;

  })(PlotOps);

}).call(this);

//# sourceMappingURL=highcharts.js.map
