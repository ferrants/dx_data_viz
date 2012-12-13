var DM = {
  header: [],
  data: []
};

(function($){

  var getWH = function(){
    var winW = 630, winH = 460;
    if (document.body && document.body.offsetWidth) {
     winW = document.body.offsetWidth;
     winH = document.body.offsetHeight;
    }
    if (document.compatMode=='CSS1Compat' &&
        document.documentElement &&
        document.documentElement.offsetWidth ) {
     winW = document.documentElement.offsetWidth;
     winH = document.documentElement.offsetHeight;
    }
    if (window.innerWidth && window.innerHeight) {
     winW = window.innerWidth;
     winH = window.innerHeight;
    }

    return [winW, winH];
  };

  $(document).ready(function(){

    $('form').submit(function(){ return false; });

    var server = $('#form-load-file input[name=server]').val();
    var load_from_server = function(server){
      $.ajax({
        url: server + '/list',
        dataType: 'json',
        success: function(a,b,c){
          console.log(a);
          add_files(a);
        }
      });
    };
    load_from_server(server);
    $('#form-load-file input[name=server]').change(function(){
      load_from_server($(this).val());
    });

    $('#form-load-file').submit(function(){
      var server = $('input[name=server]', this).val();
      var url = server + '/' + $('select[name=file]', this).val();
      console.log("Fetching Url: " + url);
      $.ajax({
        url: url,
        success: function(a,b,c){
          r = a.split('\n');
          header = r[0];
          DM.header = header.split(',');
          set_dimension_metrics();
          r.splice(0,1);
          DM.data = [];
          for (var i in r){
            DM.data.push(r[i].split(','));
          }
        }
      });

      $('#form-dimension-metric').submit(function(){
        var dimension = $('select[name=dimension]', this).val();
        var metric = $('select[name=metric]', this).val();
        var threshold = $('input[name=threshold]', this).val();
        var threshold_field = $('select[name=threshold-field]', this).val();
        var view = $('select[name=view]', this).val();

        console.log(dimension);
        console.log(metric);
        console.log(threshold);
        console.log(view);

        show_data(dimension, metric, threshold, threshold_field, view);

      });

    });

  });

  var add_files = function(files){
    var list = $('select.file-list').empty();
    for (var file in files){
      $("<option value='"+ files[file] +"'>"+ files[file] +"</option>").appendTo(list);
    }
  };

  var set_dimension_metrics = function(){
    $('.field-fill').empty();
    for (var field in DM.header){
      $("<option value='"+ field +"''>"+ prettify(DM.header[field]) +"</option>").appendTo('.field-fill');
    }
  };

  function prettify(string)
  {
      return (string.charAt(0).toUpperCase() + string.slice(1)).replace(/_/g,' ');
  }

  var show_data = function(dimension, metric, threshold, threshold_field, view){
    var dataset = [];
    var dimension_value;
    var metric_value;
    threshold = parseInt(threshold, 10);

    if (threshold){
      console.log(threshold);
    }

    for (var i in DM.data){
      dimension_value = DM.data[i][dimension];
      metric_value = parseInt(DM.data[i][metric], 10);
      if (dimension_value){
        if (!threshold || parseInt(DM.data[i][threshold_field], 10) > threshold){
          dataset.push([dimension_value, metric_value]);
        }
      }
    }
    dataset.sort(function(a,b){ return b[1] - a[1]; });
    console.log(dataset);

    if (!threshold){
      show[view](dataset.slice(0, 100));
    }else{
      show[view](dataset);
    }
  };


  var show = {
    cloud: function(set){
      var fill = d3.scale.category20();

      words = [];
      for (var i in set){
        if (set[i][1]){
          words.push(set[i]);
        }
      }

      var max = words[0][1];
      var min = words[words.length - 1][1];
      var min_size = 10;
      var max_size = 72;

      var font_scale = d3.scale.log().domain([min, max]).range([min_size, max_size]);

      window_dimensions = getWH();
      winW = window_dimensions[0] - $('.span2').width();
      winH = window_dimensions[1];
      reset_canvas();
      $('#view_canvas').addClass('cloud');
      d3.layout.cloud().size([winW, winH])
          .words(words.map(function(elem) {
            console.log(elem);
            return {text: elem[0], size: font_scale(elem[1])};
          }))
          .timeInterval(10)
          .rotate(function(d) { return ~~(Math.random() * 5) * 30 - 60; })
          .font("Impact")
          .padding(1)
          .fontSize(function(d) { return d.size; })
          .on("end", draw)
          .start();

      function draw(words) {
        d3.select("#view_canvas").append("svg")
            .attr("width", winW)
            .attr("height", winH)
          .append("g")
            .attr("transform", "translate("+ winW/2 +","+ winH/2 +")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text.substring(0,12); });
      }
    },
    list: function(set){
      reset_canvas();
      $('#view_canvas').addClass('list');
      var max = set[0][1];
      var min = set[set.length - 1][1] || 1;
      var min_size = 10;
      var max_size = 72;

      var font_scale = d3.scale.log().domain([min, max]).range([min_size, max_size]);
      for (var i in set){
        console.log(set[i]);
        if (set[i][1] > 0){
            $('<div>').appendTo('#view_canvas').text(set[i][0]).css({'font-size': font_scale(set[i][1]), 'line-height': 1});
        }
      }

    },
    table: function(set){
      reset_canvas();
      $('#view_canvas').addClass('table');
      var table = $('<table>').appendTo('#view_canvas');
      for (var i in set){
        console.log(set[i]);
        $('<tr><td>'+ set[i][0] +'</td><td>'+ set[i][1] +'</td></tr>').appendTo(table);
      }

    }
  };

  var reset_canvas = function(){
    $('#view_canvas').empty();
    for (var view in show){
      $('#view_canvas').removeClass(view);
    }

  };

})(jQuery);