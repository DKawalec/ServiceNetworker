app.directive('d3Svg', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {  
      var svg = d3.select(element[0])
      .append('svg')
      .style('width', '100%');

      window.onresize = function() {
        scope.$apply();
      };

      // Watch for resize event
      scope.$watch(function() {
        return angular.element($window)[0].innerWidth;
      }, function() {
        scope.render(scope.data);
      });

      scope.$watch('data', function(newVals, oldVals) {
        return scope.render(newVals);
      }, true);

      scope.render = function(data) {
        console.log(data, d3.select(element[0]).node())
        svg.selectAll('*').remove();

        var width = d3.select(element[0]).node().offsetWidth,
          //TODO: calculate height responsively
          height = 800,
          centerPoint = { x: width/2, y: height/2},
          modifiers = [{x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: -1}, {x: -1, y: 1}];

        svg.attr('height', height);

        if (!data) {
          svg.append('text')
            .attr('fill', '#ccc')
            .attr('stroke', '#bbb')
            .attr('y', 200)
            .attr('x', centerPoint.x)
            .attr('text-anchor', 'middle')
            .attr('font-size', '26px')
            .text('Use the panel to the left to load XML service data.');
          return;
        }


        svg.selectAll('circle')
          .data(data).enter()
            .append('circle')
            .attr('r', 20)
            .attr('cx', function(d,i){ return centerPoint.x + modifiers[i%4].x*(i+1)*20; })
            .attr('cy', function(d,i){ return centerPoint.y + modifiers[i%4].y*(i+1)*20; })
            .attr('fill', '#0078e7');
      }
    }
  };
}]);