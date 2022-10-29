
var tableForPut = {};
var tableForCall = {};
var additionalDeails = {};
var additionalDeailsCall = {};


var commonColDef = [

	{
		target: 0,
		visible: false,
	},

	{
		target: 1,
		visible: false,
	},
	{
		target: 2,
		visible: false,
	},
	{
		target: 3,
		visible: false,
	}
];
var columnsForCall = [
	{ title: 'Date (Days to expire)' },
	{ title: 'Difference' },
	{ title: 'Percentage' },
	{ title: 'Time' },
	{ title: 'Strike' },
	{ title: 'ITM Percent' },
	{ title: 'Premium' },
	{ title: 'Intrinsic Value' },
	{ title: 'Time Value' },
	{ title: '% Time Value' },
	{ title: 'Guranteed Return' },



];
var columnsForPut = [
	{ title: 'Date (Days to expire)' },
	{ title: 'Difference' },
	{ title: 'Percentage' },
	{ title: 'Time' },
	{ title: 'Strike' },
	{ title: 'ITM Percent' },
	{ title: 'Premium' },
	{ title: 'Intrinsic Value' },
	{ title: 'Time Value' },
	{ title: '% Time Value' },
	{ title: 'Total Cost' },
	{ title: '$/% Risk' },
	{ title: 'Guranteed Return' },



];

var val_range;
var sal_range;
var tv_range;
var itm_range;
$.fn.dataTable.ext.search.push(
	function(settings, data, dataIndex) {
		var min = parseFloat(val_range.slider("values", 0));
		var max = parseFloat(val_range.slider("values", 1));
		var col = parseFloat(data[1]) || 0; // data[number] = column number
		if ((isNaN(min) && isNaN(max)) ||
			(isNaN(min) && col <= max) ||
			(min <= col && isNaN(max)) ||
			(min <= col && col <= max)) {
			return true;
		}
		return false;
	},
	function(settings, data, dataIndex) {
		var min = parseFloat(sal_range.slider("values", 0));
		var max = parseFloat(sal_range.slider("values", 1));
		var col = parseFloat(data[2]) || 0; // data[number] = column number
		if ((isNaN(min) && isNaN(max)) ||
			(isNaN(min) && col <= max) ||
			(min <= col && isNaN(max)) ||
			(min <= col && col <= max)) {
			return true;
		}
		return false;
	},
	function(settings, data, dataIndex) {
		var min = parseFloat(tv_range.slider("values", 0));
		var max = parseFloat(tv_range.slider("values", 1));
		var col = parseFloat(data[3]) || 0; // data[number] = column number
		if ((isNaN(min) && isNaN(max)) ||
			(isNaN(min) && col <= max) ||
			(min <= col && isNaN(max)) ||
			(min <= col && col <= max)) {
			return true;
		}
		return false;
	}, function(settings, data, dataIndex) {
		var min = parseFloat(itm_range.slider("values", 0));
		var max = parseFloat(itm_range.slider("values", 1));
		var col = parseFloat(data[5]) || 0; // data[number] = column number
		if ((isNaN(min) && isNaN(max)) ||
			(isNaN(min) && col <= max) ||
			(min <= col && isNaN(max)) ||
			(min <= col && col <= max)) {
			return true;
		}
		return false;
	}
);


function populateRow(option, diff) {

	









	var row = [];


	//{ title: 'Date (Days to expire)' },
	row.push(option.expiration_date + ' (' + diff + ' days)');

	//	{ title: 'Difference' },
	row.push(diff);

	//	{ title: 'Percentage' },
	row.push(option.percentLost);

	//{ title: 'Time %' },
	row.push(parseFloat(100 * (option.timeValue / option.last)).toFixed(2));



	//	{ title: 'Strike' },
	row.push(option.strike);


	//{ title: 'ITM Percent' },
	row.push(Math.round(100 * ((option.strike - lastPrice) / lastPrice)));


	//	{ title: 'Premium' },
	row.push('$' + parseFloat(option.last).toFixed(2));

	//{ title: 'Intrinsic Value' },
	row.push('$' + parseFloat(option.intrinsicValue).toFixed(2));

	//{ title: 'Time Value' },
	row.push('$' + parseFloat(option.timeValue).toFixed(2));

	//{ title: '% Time Value' },
	row.push(parseFloat(100 * (option.timeValue / option.last)).toFixed(2) + "%");


	if (option.symbol.slice(6).indexOf('C') > -1) {

		//	{ title: 'Guranteed Return' },
		row.push('$' + (option.last * 100).toFixed(0));
	} else {

		//{ title: 'Total Cost' },
		row.push('$' + parseFloat(100 * (purchasePrice + option.last)).toFixed(0) + ' (' + (100 * purchasePrice).toFixed(0) + '+' + (100 * option.last).toFixed(0) + ')');


		//{ title: '$/% Risk' },
		row.push('$' + parseFloat(100 * option.amountLost).toFixed(0) + '/' + option.percentLost + "%");

		//{ title: 'Guranteed Return' },
		row.push('$' + (option.strike * 100));

	}
	return row;
}


function populateOptionTab(dateWiseOptions, today, priceWise, tableId, columnsPassed, additionalDeailsKey, optionType, modalId) {


	$('.myslider').show();

	$(tableId + ' tbody').off('click');

	if (optionType == 'CALL') {

		var tablePassed = tableForCall;

	} else {

		var tablePassed = tableForPut;

	}

	if (tablePassed.destroy) {
		tablePassed.destroy();
	}





	var dataSet = [
	];



sal_range = $("#val_range_salary");
	tv_range = $("#val_range_tv");
	itm_range = $("#val_range_itm");
	val_range = $("#val_range");
	var live_range_val = $("#live_range_val");
	var val_range_salary = $("#live_range_val_salary");
	var val_range_tv = $("#live_range_val_tv");
	var val_range_itm = $("#live_range_val_itm");
	// EXPIRY SLIDER

	val_range.slider({
		range: true,
		min: 1,
		max: 1000,
		
		step: 1,
		values: [90, 360],
		slide: function(event, ui) {
			live_range_val.val(ui.values[0] + " - " + ui.values[1]);
		},
		stop: function(event, ui) {
			tableForPut.draw();
		}
	});
	sal_range.slider({
		range: true,
		min: -100,
		max: 100,
		step: .1,
		values: [-100, 25],
		slide: function(event, ui) {
			val_range_salary.val(ui.values[0] + " - " + ui.values[1]);
		},
		stop: function(event, ui) {
			tableForPut.draw();
		}
	});

	tv_range.slider({
		range: true,
		min: 0,
		max: 100,
		step: .1,
		values: [0, 50],
		slide: function(event, ui) {
			val_range_tv.val(ui.values[0] + " - " + ui.values[1]);
		},
		stop: function(event, ui) {
			tableForPut.draw();
		}
	});

	itm_range.slider({
		range: true,
		min: 0,
		max: 100,
		step: .1,
		values: [0, 25],
		slide: function(event, ui) {
			val_range_itm.val(ui.values[0] + " - " + ui.values[1]);
		},
		stop: function(event, ui) {
			tableForPut.draw();
		}
	});
	live_range_val.val(val_range.slider("values", 0) + " - " + val_range.slider("values", 1));
	val_range_salary.val(sal_range.slider("values", 0) + " - " + sal_range.slider("values", 1));
	val_range_tv.val(tv_range.slider("values", 0) + " - " + tv_range.slider("values", 1));
	val_range_itm.val(itm_range.slider("values", 0) + " - " + itm_range.slider("values", 1));


	_.keys(dateWiseOptions).forEach(function(date) {

		var start_date = today;
		var end_date = date;
		var diff = Math.floor((Date.parse(end_date) - Date.parse(start_date)) / 86400000);

		dateWiseOptions[date].forEach(function(option) {
			var row = populateRow(option, diff);
			dataSet.push(row);
		});

	});



	var groupColumn = 0;
	tablePassed = $(tableId).DataTable({
		columnDefs: commonColDef,
		responsive: {
			details: {
				type: 'column',
				target: -1
			}
		},
		order: [[groupColumn, 'asc']],
		fixedHeader: true,
		drawCallback: function(settings) {
			var api = this.api();
			var rows = api.rows({ page: 'current' }).nodes();
			var last = null;

			api
				.column(groupColumn, { page: 'current' })
				.data()
				.each(function(group, i) {
					if (last !== group) {
						$(rows)
							.eq(i)
							.before('<tr class="group"><td colspan="5"><strong>' + group + '</strong></td></tr>');

						last = group;
					}
				});
		},
		data: dataSet,
		"paging": false,
		columns: columnsPassed,
	});


	if (optionType == 'CALL') {

		tableForCall = tablePassed;

	} else {

		tableForPut = tablePassed;

	}



	// Add event listener for opening and closing details


	$(tableId + ' tbody').on('click', 'tr', function() {

		if (additionalDeails.destroy) {
			additionalDeails.destroy();
		}
		var data = tablePassed.row(this).data();

		var price = data[4];


		var setForPrice = [];
		priceWise[price].forEach(function(option) {
			var start_date = today;
			var end_date = option.expiration_date;
			var diff = Math.floor((Date.parse(end_date) - Date.parse(start_date)) / 86400000);

			var row = populateRow(option, diff)
			setForPrice.push(row);
		});


		additionalDeails = $(additionalDeailsKey).DataTable({
			columnDefs: [
				{
					target: 1,
					visible: false,
				},
				{
					target: 2,
					visible: false,
				},
				{
					target: 3,
					visible: false,
				}
			],
			order: [[groupColumn, 'asc']],
			fixedHeader: true,
			data: setForPrice,
			"paging": false,

			columns: columnsPassed,
		});

		$(modalId).modal('show');

	});




}



function populate() {




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

	let that = this;
	getOptionChain().then(function(state) {

		populateOptionTab(state.dateWisePuts, today, state.priceWisePuts, '#datewise-puts', columnsForPut, '#additional_details_put', 'PUT', '#addionalDetailsPut');
		populateOptionTab(state.dateWiseCalls, today, state.priceWiseCalls, '#datewise-calls', columnsForCall, '#additional_details_call', 'CALL', '#addionalDetailsCall');



	});
}

$(function() {

	$("#slider").slider();
	$('.myslider').hide();
	if (localStorage.getItem('access')) {
		$('#key').hide();
	}

	$('#form-submit').click(function() {


		if (!localStorage.getItem('access') && $('#key').val()) {
			localStorage.setItem('access', $('#key').val());
		}



		sessionStorage.setItem('symbol', $('#symbol').val());
		//window.location.reload();
		populate();
	})



});