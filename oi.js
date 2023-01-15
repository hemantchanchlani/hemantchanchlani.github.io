var calls = [];
var puts = [];
var openInterestChart = null;
var volumeChart = null;
var pcrChart = null;

var strikeRange = 400;
var openToday = 4000;

var callOI = {};
var putOI = {};
var supportNumbers = [];
var resistancetNumbers = [];
var maxOpenInterest = 50;

var saveInLocal = true;

var access = localStorage.getItem('access');

function prepareChart() {

	openInterestChart = new Chart(
		document.getElementById('open_interest'),
		{
			type: 'line',
			plugins: [ChartDataLabels],
			data: {

				datasets: [{
					label: 'calls',
					data: calls
				},
				{
					label: 'puts',
					data: puts
				}]
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
					}
				}]
			},
			options: {
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'top',
						formatter: function(value, context) {
							return value.strike + "(" + value.open_interest + ")";
						},
						color: 'black',
						font: {
							size: '9'
						}
					}
				},
				parsing: {
					xAxisKey: 'strikeLabel',
					yAxisKey: 'open_interest',
				}
			}
		}
	);


	volumeChart = new Chart(
		document.getElementById('volumeChart'),
		{
			type: 'line',
			plugins: [ChartDataLabels],
			data: {

				datasets: [{
					label: 'calls',
					data: calls
				},
				{
					label: 'puts',
					data: puts
				}]
			},
			options: {
				plugins: {
					datalabels: {
						anchor: 'end',

						align: 'top',
						formatter: function(value, context) {
							return value.volume;
						},
						formatter: function(value, context) {
							return value.strike + "(" + value.open_interest + ")";
						},
						color: 'black',
						font: {
							size: '9'
						}
					}
				},
				maintainAspectRatio: true,
				parsing: {
					xAxisKey: 'strikeLabel',
					yAxisKey: 'volume'
				}
			}
		}
	);



	pcrChart = new Chart(
		document.getElementById('PCR'),
		{
			type: 'line',
			plugins: [ChartDataLabels],
			data: {

				datasets: [{
					label: 'SUPPORT',
					data: supportNumbers
				}, {
					label: 'RESISTANCE',
					data: resistancetNumbers
				}]
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
					}
				}]
			},
			options: {
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'top',
						formatter: function(value, context) {
							return value.supportOrResistance;
						},
						color: 'black',
						font: {
							size: '10'
						}
					}
				},
				parsing: {
					xAxisKey: 'strikeLabel',
					yAxisKey: 'supportOrResistance',
				}
			}
		}
	);



}

prepareChart();




function getQuotes(time, fileName) {

	var symbol = 'SPX';

	var today = new Date();
	var dd = today.getDate();

	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	if (dd < 10) {
		dd = '0' + dd;
	}

	if (mm < 10) {
		mm = '0' + mm;
	}
	today = yyyy + '-' + mm + '-' + dd;

	var dateOfExpiry = today;



	var values = window.location.href.split('?');

	if (values.length > 0) {
		var vals = window.location.href.split('?')[1].split('|');

		symbol = vals[0];

		if (vals.length > 1) {
			dateOfExpiry = '2023' + '-' + vals[1];

		}


	}


	console.log(today);


	$.ajax({
		type: 'get',
		url: 'https://api.tradier.com/v1/markets/quotes',
		data: {
			'symbols': symbol,
		},
		headers: {
			'Authorization': 'Bearer ' + access,
			'Accept': 'application/json'
		},
		success: function(data, response, code) {
			openToday = data.quotes.quote.last;
			getOpenInt(symbol, dateOfExpiry);
			setInterval(function() {
				getOpenInt(symbol, dateOfExpiry);
			}, 2000000);

		}
	}

	);
}


function getOpenInt(symbol, dateOfExpiry) {




	console.log(symbol, dateOfExpiry);


	$.ajax({
		type: 'get',
		url: 'https://api.tradier.com/v1/markets/options/chains',
		data: {
			'symbol': symbol,
			'expiration': dateOfExpiry,
			'greeks': 'true'
		},
		headers: {
			'Authorization': 'Bearer ' + access,
			'Accept': 'application/json'
		},
		success: function(data, response, code) {
			calls = [];
			puts = [];
			supportNumbers = [];
			resistancetNumbers = [];
			volumeChart.destroy();
			openInterestChart.destroy();
			pcrChart.destroy();



			var options = data.options.option;




			options.forEach(function(option, i) {

				if (Math.abs(option.strike - openToday) <= strikeRange) {
					option.strikeLabel = option.strike + '';

					if (option.symbol.slice(6).indexOf('P') > -1) {
						puts.push(option);
						putOI[option.strikeLabel] = option.open_interest;
					}


					if (option.symbol.slice(6).indexOf('C') > -1) {
						calls.push(option);
						if (option.open_interest > maxOpenInterest) {
							callOI[option.strikeLabel] = option.open_interest;
						}
					}
				}



			});


			if (saveInLocal) {

				var now = new Date();

				var key = symbol + '-' + dateOfExpiry + '-' + new Date().toLocaleTimeString();

				localStorage.setItem(key + '-calls', JSON.stringify(calls));
				localStorage.setItem(key + '-puts', JSON.stringify(puts));

				saveInLocal = false;
			}

			Object.keys(callOI).forEach(function(strikeLabel) {

				if (putOI[strikeLabel] && Math.round(Math.abs(callOI[strikeLabel] / putOI[strikeLabel])) < 50 && Math.round(Math.abs(putOI[strikeLabel] / callOI[strikeLabel]) < 50)) {

					var oneVal = {};

					oneVal.strikeLabel = strikeLabel;
					oneVal.supportOrResistance = Math.round(Math.abs(putOI[strikeLabel] / callOI[strikeLabel]));
					supportNumbers.push(oneVal);



					var secondVal = {};

					secondVal.strikeLabel = strikeLabel;
					secondVal.supportOrResistance = Math.round(Math.abs(callOI[strikeLabel] / putOI[strikeLabel]));
					resistancetNumbers.push(secondVal);

				}




			})



			prepareChart();
		}
	}

	);
}
getQuotes();
setInterval(function() {
	saveInLocal = true;
}, 120000);