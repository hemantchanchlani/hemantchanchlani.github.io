var calls = [];
var puts = [];
var openInterestChart = null;
var volumeChart = null;
var pcrChart = null;
var lastPcrChart = null;

var strikeRange = 200;
var openToday = 4000;

var callOI = {};
var putOI = {};
var supportNumbers = [];
var resistancetNumbers = [];
var maxOpenInterest = 50;
var lastPCRs = [];
var maxOpenInterest = 150;

var saveInLocal = true;

var access = localStorage.getItem('access');

function footer(tooltipItems) {
	let sum = 0;

	tooltipItems.forEach(function(tooltipItem) {
		sum += tooltipItem.parsed.y;
	});
	return 'Sum: ' + sum;
};

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
				interaction: {
					intersect: false,
					mode: 'index',
				},
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
				interaction: {
					intersect: false,
					mode: 'index',
				},
				plugins: {
					datalabels: {
						anchor: 'end',

						align: 'top',
						formatter: function(value, context) {
							return value.volume;
						},
						formatter: function(value, context) {
							return value.strike + "(" + value.volume + ")";
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



	lastPcrChart = new Chart(
		document.getElementById('lastPCR'),
		{
			type: 'line',
			plugins: [ChartDataLabels],
			data: {

				datasets: [{
					label: 'PCR Ratio',
					data: lastPCRs
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
				interaction: {
					intersect: false,
					mode: 'index',
				},
				plugins: {
					datalabels: {
						anchor: 'end',
						align: 'top',
						formatter: function(value, context) {
							return value.ratio;
						},
						color: 'black',
						font: {
							size: '10'
						}
					}
				},
				parsing: {
					xAxisKey: 'time',
					yAxisKey: 'ratio',
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
					label: 'SUPPORT (Puts / Calls)',
					data: supportNumbers
				}, {
					label: 'RESISTANCE (Calls / Puts) ',
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
				interaction: {
					intersect: false,
					mode: 'index',
				},
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
			openToday = data.quotes.quote.open;
			getOpenInt(symbol, dateOfExpiry);
			setInterval(function() {
				getOpenInt(symbol, dateOfExpiry);
			}, 1 * 60 * 1000);

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
			lastPcrChart.destroy();
			var options = data.options.option;

			var sumofPuts = 0;
			var sumOfCalls = 0;


			options.forEach(function(option, i) {
				if (Math.abs(option.strike - openToday) <= strikeRange) {
					option.strikeLabel = option.strike + '';

					if (option.symbol.slice(6).indexOf('P') > -1) {
						puts.push(option);
						sumofPuts += option.open_interest;
						putOI[option.strikeLabel] = option.open_interest;
					}


					if (option.symbol.slice(6).indexOf('C') > -1) {
						calls.push(option);
						sumOfCalls += option.open_interest;
						if (option.open_interest > maxOpenInterest) {
							callOI[option.strikeLabel] = option.open_interest;
						}
					}
				}
			});

			var timeOfData = new Date().toLocaleString('en-US', {
				hour12: false,
			});

			var key = symbol + '-' + dateOfExpiry + '-' + timeOfData;

			var keyforPCR = symbol + '-' + dateOfExpiry + '-pcr';


			var previous = localStorage.getItem(keyforPCR);
			if (previous) {
				lastPCRs = JSON.parse(previous);
			}
			var item = {};
			item.time = timeOfData;
			item.ratio = (sumofPuts / sumOfCalls).toFixed(2);
			lastPCRs.push(item);

			localStorage.setItem(keyforPCR, JSON.stringify(lastPCRs));


			if (saveInLocal) {
				localStorage.setItem(key + '-calls', JSON.stringify(calls));
				localStorage.setItem(key + '-puts', JSON.stringify(puts));
				saveInLocal = false;
			}

			Object.keys(callOI).forEach(function(strikeLabel) {

				if (putOI[strikeLabel] && Math.round(Math.abs(callOI[strikeLabel] / putOI[strikeLabel])) < 50 && Math.round(Math.abs(putOI[strikeLabel] / callOI[strikeLabel]) < 50)) {

					var oneVal = {};

					oneVal.strikeLabel = strikeLabel;
					oneVal.supportOrResistance = Math.round(putOI[strikeLabel] / callOI[strikeLabel] * 100) / 100;
					supportNumbers.push(oneVal);

					var secondVal = {};
					secondVal.strikeLabel = strikeLabel;
					secondVal.supportOrResistance = Math.round(callOI[strikeLabel] / putOI[strikeLabel] * 100) / 100;;
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