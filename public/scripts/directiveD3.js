app.directive('d3Svg', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      link: '='
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
        return scope.render(newVals, scope.link);
      }, true);
      scope.$watch('link', function(newVals, oldVals) {
        return scope.render(scope.data, newVals);
      }, true);

      scope.render = function(data, links) {
        // console.log(data, links)
        svg.selectAll('*').remove();

        var width = d3.select(element[0]).node().offsetWidth,
          //TODO: calculate height responsively
          height = 800,
          centerPoint = { x: width/2, y: height/2},
          force, links, nodes, nodeCaptions;

        svg
          .attr('height', height)
          .attr('fill', '#E9EFF5');

        if (!(data && links)) {
          svg
            .append('text')
            .attr('fill', '#ccc')
            .attr('stroke', '#bbb')
            .attr('y', 200)
            .attr('x', centerPoint.x)
            .attr('text-anchor', 'middle')
            .attr('font-size', '26px')
            .text('Use the panel to the left to load valid XML service data.');
          return;
        }

        force = d3.layout.force()
          .nodes(data)
          .links(links)
          .size([width*.8,height*0.8])
          .linkStrength(0.1)
          .friction(0.9)
          .linkDistance(200)
          .charge(-30)
          .gravity(0.1)
          .theta(0.8)
          .alpha(0.1)
          .start();

        links = svg.selectAll('line')
          .data(links)
          .enter().append('line')
          .attr('stroke', '#777')
          .attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

        nodes = svg.selectAll('circle')
          .data(data).enter()
          .append('circle')
          .attr('r', 20)
          .attr('fill', '#0078e7');

        nodeCaptions = svg.selectAll('text')
          .data(data).enter()
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#FFF')
          .text(function(d) {return d.nodeId});

        force.on('tick', tick);

        function tick() {
          links
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

          nodes
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });

          nodeCaptions
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; });
        }
      };
    }
  };
}]);