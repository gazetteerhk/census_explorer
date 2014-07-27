Walkthrough of front end code
=============================

Overview
--------

The app is split up into two parts: the frontend and backend.  The backend has a single API endpoint that
serves up all of the data underlying the visualizations.  It also supports filters, so you can limit the data
returned by the API to certain subsets.  The data is not gigantic, but it is large enough where we don't
want the browser to have to download the whole dataset each time the user loads a new page.

The frontend is responsible for requesting data from the API, recombining the data into a format usable by the
charting code, then drawing the charts.

Data
----

The data is census data for neighborhoods in Hong Kong.  Our preprocessing script takes the data from spreadsheets
like [this one](http://www.census2011.gov.hk/en/district-profiles/ca/sham-shui-po/f08.html), and 
smushes it all into a single table.  The resulting "cleaned" dataset is basically the table
that is shown on the [API browser](http://gazetteer.hk/#/browser) page.

So in other words, each row in the table represents a single cell in the original spreadsheets.

The backend API then serves up this data table given a set of filters.

CensusAPI.js
------------

The first thing that we have to do is build an abstraction of the API in the frontend.  Queries to the API are
basically requests to urls like this:

`http://gazetteer.hk/api/?area=a01,a02&table=1`

Everything before the `?` is the base URL of the endpoint, and everything after it is a query string that specifies
the filters.  In plain text, this query says that I want all of the data for areas a01 and a02 from table 1.

It is tedious to have to construct this full URL every time we want to get data from the API, so we want something
that creates and executes these queries consistently.  This is the `Query` object that is [defined here](https://github.com/gazetteerhk/census_explorer/blob/master/frontend/app/scripts/services/CensusAPI.js#L158).

You can instantiate a Query object with filters, or you can add filters as you go with [`addParam()`](https://github.com/gazetteerhk/census_explorer/blob/master/frontend/app/scripts/services/CensusAPI.js#L195).
The actual request is not executed until you call [`fetch()`](https://github.com/gazetteerhk/census_explorer/blob/master/frontend/app/scripts/services/CensusAPI.js#L217).

Filters are represented as a JavaScript object, so the filter from the request above would be something like this:

```javascript
{
  area: {a01: true, a02: true},
  table: {1: true},
  // ... More filters for other filterable fields
}
```

If I had a Query object with these filters, and then I called `myQuery.addParam('area', 'a03')`, then my filter object
would look like this:

```javascript
{
  area: {a01: true, a02: true, a03: true},
  table: {1: true},
  // ... More filters for other filterable fields
}
```

The filter object also had to have the property where if I tried to add a value that was already present, then 
it would not duplicate the value.  So if I called `myQuery.addParam('area', 'a03')` again, then the filter object
would not change.  This is why we use nested objects, since JS does not have a Set class.

It looks like we didn't implement a `removeParam()` method, but you could easily do so with this data structure.

When the filters are set and you are ready to send the request, you call `fetch()`.  This method then builds the
query URL and sends the request to the backend over HTTP.  We use a deferred object model instead of a callback
to handle the asynchronous request (this is a rather large topic in itself that I can suggest other reading for).

The other functions in the file are for recombining the data in various ways to get the groupings needed for the
charts.  Basically pivot table like functionality.

The Area Profile Visualization
------------------------------

The area profile visualization allows the user to click on a single area, then shows a handful of charts that
show the demographics of that area.  In pseudocode, the interaction typically goes like this:

  - User clicks an area on the map
  - Frontend queries the API for the data for that area
  - For each chart:
    - Clear the targeted div of any existing charts
    - Pivot/aggregate the data to the format needed for the chart
    - Draw the chart
    
The interaction starts [here](https://github.com/gazetteerhk/census_explorer/blob/master/frontend/app/scripts/controllers/profiles.js#L37),
where a watcher listens for any changes in the data structure that keeps track
of which area was clicked.  The below code includes Angular conventions, since that was
the frontend library that we used.

```javascript
$scope.$watch('selection', function() {
  if($scope.selection.selectedAreas().length == 0) {
    return;
  }
 
  var query = new CensusAPI.Query(baseQuery);
  var areas = $scope.selection.selectedAreas();
```

There is a bit of code here to get the display name of the clicked area from the translation map.  A district is a
larger geographical unit and contains many areas.  You can think of districts as states, and areas as counties.

```javascript
  // Get the name of the area to display
  if (areas.length > 1) {
    // Selected a district
    var districtCode = areas[0][0];
    $scope.selectionName = i18n.t('district.' + districtCode);
  } else {
    // Selected an area
    $scope.selectionName = i18n.t('area.' + areas[0]);
  }
```

Then we build the query, fetch it, and save it to the `$scope._queryData` object.  `redrawCharts()` kicks off the
chart drawing code.  All of that is delayed a bit to get the animations to work correctly.  The last timeout
is also purely an animation.

```javascript
  // Add the selected area to the filter
  query.addParam('area', areas);

  // Delay fetching so that the scrolling finishes first
  // Hurts response time on first query, but helps animation on later queries
  $timeout(function() {
    query.fetch().then(function(res) {
      $scope._rawResponse = res;
      $scope._queryData = CensusAPI.joinData(res.data);
      $scope.redrawCharts();
    });
  }, 300);

  // Scroll to the results section
  // Must delay this so that the section can show
  $timeout(function() {$('body').animate({scrollTop: $('#profile-charts').offset().top}, 'slow')}, 100);

}, true);
```

The `redrawCharts()` function loops through each chart that needs to be drawn and does basically the same thing, so
I'll just go over one of the charts drawn by the function `_drawAge()`.

```javascript
$scope._drawAge = function() {
  // Get the element to draw the chart in, and clear it if anything is already in it
  var elemSelector = "#profile-age";
  _clearChart(elemSelector);
```

The below does a bit of pivoting of the data to get it into the shape necessary for the charting.  I wouldn't
bother with understanding the details, since it's specific to this dataset.  After the data is pivoted and cleaned,
it gets added to the final data array.

```javascript
  var filters = ['l6_male', 'm6_female'];
  var filtered = _.filter($scope._queryData, function(val) {return (filters.indexOf(val.column) > -1);});
  var grouped = CensusAPI.sumBy(filtered, ['row', 'column']);  //  Need this to handle district aggregates

  var data = [];
  _.forOwn(grouped, function(val, key) {
    var split = key.split(',');
    data.push({"Age Group": i18n.t('row.' + split[0]),
      Gender: i18n.t('column.' + split[1]),
      Population: split[1] === 'l6_male' ? (-1 * val) : val});
  });
```

Here we use [Dimple](http://dimplejs.org/) to draw the chart.  Dimple is just a slightly higher level library
 on top of d3, so we don't have to mess with all of the things like manually drawing the axes and calculating
  the scales.  Finally we store the chart in a cache on the page, so that we can refer to it later to clear it away.

```javascript
  // Make the chart
  var svg = dimple.newSvg(elemSelector, undefined, 300);
  var chart = new dimple.chart(svg, data);
  chart.setBounds("13%", 0, "85%", "85%");
  chart.addMeasureAxis('x', 'Population');
  var y = chart.addCategoryAxis('y', 'Age Group');
  y.addOrderRule(_.map(Indicators.ordering.ageGroup, function(k) {return i18n.t('row.' + k);}), true);
  chart.addSeries('Gender', dimple.plot.bar);
  chart.addLegend("75%", "77%", "30%", "10%");
  chart.draw(1000);
  _addChartToCache(elemSelector, svg, chart);
};
```
