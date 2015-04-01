$(function() {
  'use strict';
  var chart,
      fromDate,
      toDate,
      last30,
      yesterday;

// Functions ------------------------------
  function formatDate(date, divider ) {
    var month = date.getMonth()+1,
    day = date.getDate(),
    year = date.getFullYear();

    if (month < 9) { month = '0' + month; }
    if (day < 9) { day = '0' + day; }

    return ('' + year + divider + month + divider + day);
  }

  function getMean(myArray) {
      var mean = myArray.reduce(function(a, b) { return a + b; })/myArray.length;
      return mean.toFixed(2);
  }

  function getMedian(myArray) {
    var median;
    var sorted = myArray.sort(myArray);

    var middle = Math.floor((sorted.length) / 2);
    if(sorted.length % 2 === 0) {
      var medianA = sorted[middle];
      var medianB = sorted[middle-1];
      median = (medianA + medianB) / 2;
    } else {
      median = sorted[middle + 1];
    }
    return median.toFixed(2);
  }

  function initChart(data) {
    chart = c3.generate({
      data: {
          x: 'x',
          columns: data,
          type: 'bar',
          groups: [
              ['Mean Temperature', 'Median Temperature', 'Mean Pressure', 'Median Pressure', 'Median Speed', 'Mean Speed']
          ]
      },
      bar: {
          width: {
              ratio: 0.9
          }
      },
      axis: {
          x: {
              type: 'timeseries',
              tick: {
                  format: '%Y-%m-%d'
              }
          }
      },
      subchart: {
          show: true
      }
    }); //generate chart
  }


  function processData(data) {
    var myData = [];

    var myDates = ['x'];
    var meanTemps = ['Mean Temperature'];
    var medTemps = ['Median Temperature'];
    var meanPress = ['Mean Pressure'];
    var medPress = ['Median Pressure'];
    var medSpeeds = ['Median Speed'];
    var meanSpeeds = ['Mean Speed'];
    var id = 0;

    for ( var key in data) {
      if (data.hasOwnProperty(key)) {
        if ((data[key].t !== null) && 
            (data[key].p !== null) && 
            (data[key].s !== null)) {
          myDates.push(key);
          meanTemps.push(getMean(data[key].t));
          medTemps.push(getMedian(data[key].t));
          meanPress.push(getMean(data[key].p));
          medPress.push(getMedian(data[key].p));
          meanSpeeds.push(getMean(data[key].s));
          medSpeeds.push(getMedian(data[key].s));
          id++;
        }
      } //hasOwnProperty
    } //for loop


    myData.push(myDates, meanTemps, medTemps, meanPress, medSpeeds, meanSpeeds);
    return myData;
  } //processData


  fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 31);

  toDate = new Date();
  toDate.setDate(toDate.getDate() - 1);

  document.forms.rangeform.from.value = formatDate(fromDate, '-');
  document.forms.rangeform.to.value = formatDate(toDate, '-');


$.ajax({
    url: 'http://foundationphp.com/phpclinic/podata.php?raw&callback=?',
    jsonpCallback: 'jsonReturnData',
    dataType: 'jsonp',
    data: {
        startDate: formatDate(fromDate, ''),
        endDate: formatDate(toDate, ''),
        format: 'json'
    },
    success: function( response ) {
      initChart(processData(response));
    }
});

document.forms.rangeform.addEventListener('change', function(e) {
  console.log(e.target.value);     
  console.log(e.target.name);     
}, false);

//Events
  document.rangeform.onsubmit=function() {
    var from = new Date(document.rangeform.from.value);
    var to = new Date(document.rangeform.to.value);
  	var earliest = new Date('2011-01-01');
  	var validDate = true;
  	//var invalidMessage = '';

  	if (from < earliest || to >= yesterday) {
  		 validDate = false;
  		$('#badDate').modal('show');
  	}
    	return false;
  };
});