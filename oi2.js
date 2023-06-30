

var accountNumber = 'VA94962097';

var access = localStorage.getItem('access');

var myPositions, myOrders;

function urlstringify(data) {

	var url = Object.keys(data).map(function(k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
	}).join('&');

	return url;
}




function parseData(data) {
	return urlstringify(data);
}
function parseQuery(url, params) {
	const query =
		params &&
		urlstringify(params);
	return query ? `${url}?${query}` : url;
}



function footer(tooltipItems) {
	let sum = 0;

	tooltipItems.forEach(function(tooltipItem) {
		sum += tooltipItem.parsed.y;
	});
	return 'Sum: ' + sum;
};

const URLS = {
	prod: 'https://api.tradier.com/v1/',
	beta: 'https://api.tradier.com/beta/',
	sandbox: 'https://sandbox.tradier.com/v1/',
	stream: 'https://stream.tradier.com/v1',
};

class Tradier {

	constructor(accessToken, endpoint = 'prod') {
		this.accessToken = accessToken;
		this.endpoint = endpoint;
	}

	config() {
		return {
			baseURL: URLS[this.endpoint],
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: 'application/json',
			},
		};
	}
	// region Market Data
	getQuote(symbols) {
		return this.get('markets/quotes', {
			symbols: symbols,
		}).then(
			({
				data: {
					quotes: { quote },
				},
			}) => quote
		);
	}
	get(url, params, config = {}) {
		return axios.request({
			method: 'get',
			url: parseQuery(url, params),
			...this.config(),
			...config,
		});
	}



	post(url, data, config = {}) {
		return axios.request({
			method: 'post',
			url,
			data: parseData(data),
			...this.config(),
			...config,
		});
	}

	put(url, data, config = {}) {
		return axios.request({
			method: 'put',
			url,
			data: parseData(data),
			...this.config(),
			...config,
		});
	}

	delete(url, config = {}) {
		return axios.request({
			method: 'delete',
			url,
			...this.config(),
			...config,
		});
	}
	// endregion

	// region User Data
	getProfile() {
		return this.get('user/profile').then(({ data: { profile } }) => profile);
	}

	getBalances() {
		return this.get('user/balances').then(({ data: { accounts } }) => accounts);
	}

	getPositions() {
		return this.get('user/positions').then(
			({ data: { accounts } }) => accounts
		);
	}

	getHistory() {
		return this.get('user/history').then(({ data: { accounts } }) => accounts);
	}

	getGainloss() {
		return this.get('user/gainloss').then(({ data: { accounts } }) => accounts);
	}

	getOrders() {
		return this.get('user/orders').then(({ data: { accounts } }) => accounts);
	}
	// endregion

	// region Account Data
	getAccountBalances(account) {
		return this.get(`accounts/${account}/balances`).then(
			({ data: { balances } }) => balances
		);
	}

	getAccountPositions(account) {
		return this.get(`accounts/${account}/positions`).then(
			({ data: { positions } }) => positions
		);
	}

	getAccountHistory(account) {
		return this.get(`accounts/${account}/history`).then(
			({ data: { history } }) => history
		);
	}

	getAccountGainloss(account) {
		return this.get(`accounts/${account}/gainloss`).then(
			({ data: { gainloss } }) => gainloss
		);
	}

	getAccountOrders(account) {
		return this.get(`accounts/${account}/orders`).then(
			({ data: { orders } }) => orders
		);
	}

	getAccountOrder(account, orderId) {
		return this.get(`accounts/${account}/orders/${orderId}`).then(
			({ data: { order } }) => order
		);
	}
	// endregion

	// region Trading
	createOrder(account, data) {
		return this.post(`accounts/${account}/orders`, data).then(
			({ data: { order } }) => order
		);
	}

	previewOrder(account, data) {
		return this.post(`accounts/${account}/orders`, {
			...parseData(data),
			preview: true,
		}).then(({ data: { order } }) => order);
	}

	changeOrder(account, orderId, data) {
		return this.put(`accounts/${account}/orders/${orderId}`, data).then(
			({ data: { order } }) => order
		);
	}

	cancelOrder(account, orderId) {
		return this.delete(`accounts/${account}/orders/${orderId}`).then(
			({ data: { order } }) => order
		);
	}
	// endregion

	// region Market Data
	getQuote(symbols) {
		return this.get('markets/quotes', {
			symbols: symbols
		}).then(
			({
				data: {
					quotes: { quote },
				},
			}) => quote
		);
	}

	getTimesales(symbol, interval, start, end, sessionFilter) {
		return this.get('markets/timesales', {
			symbol,
			interval,
			start,
			end,
			session_filter: sessionFilter,
		}).then(({ data: { series } }) => series);
	}

	getOptionChains(symbol, expiration) {
		return this.get('markets/options/chains', { symbol, expiration }).then(
			({ data: { options } }) => options
		);
	}

	getOptionStrikes(symbol, expiration) {
		return this.get('markets/options/strikes', { symbol, expiration }).then(
			({ data: { strikes } }) => strikes
		);
	}

	getOptionExpirations(symbol, includeAllRoots) {
		return this.get('markets/options/expirations', {
			symbol,
			includeAllRoots,
		}).then(({ data: { expirations } }) => expirations);
	}

	getPriceHistory(symbol, interval, start, end) {
		return this.get('markets/history', {
			symbol,
			interval,
			start,
			end,
		}).then(({ data: { history } }) => history);
	}

	getClock() {
		return this.get('markets/clock').then(({ data: { clock } }) => clock);
	}

	getCalendar(market, year) {
		return this.get('markets/calendar', { market, year }).then(
			({ data: { calendar } }) => calendar
		);
	}

	search(q, indexes = true) {
		return this.get('markets/search', { q, indexes }).then(
			({ data: { securities } }) => securities
		);
	}

	lookup(q, exchanges, types) {
		return this.get('markets/lookup', { q, exchanges, types }).then(
			({ data: { securities } }) => securities
		);
	}

	// region Fundamentals (BETA)
	getCompany(symbols) {
		return this.get(
			'markets/fundamentals/company',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getCalendars(symbols) {
		return this.get(
			'markets/fundamentals/calendars',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getDividends(symbols) {
		return this.get(
			'markets/fundamentals/dividends',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getCorporateActions(symbols) {
		return this.get(
			'markets/fundamentals/corporate_actions',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getRatios(symbols) {
		return this.get(
			'markets/fundamentals/ratios',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getFinancials(symbols) {
		return this.get(
			'markets/fundamentals/financials',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getStatistics(symbols) {
		return this.get(
			'markets/fundamentals/statistics',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}
	// endregion

	// region Watchlists
	getWatchlists() {
		return this.get('/watchlists').then(
			({ data: { watchlists } }) => watchlists
		);
	}

	getWatchlist(id) {
		return this.get(`/watchlists/${id}`).then(
			({ data: { watchlist } }) => watchlist
		);
	}

	createWatchlist(name, symbols) {
		return this.post('/watchlists', {
			name,
			symbols: parseSymbols(symbols),
		}).then(({ data: { watchlist } }) => watchlist);
	}

	updateWatchlist(id, name, symbols) {
		return this.put(`/watchlists/${id}`, {
			name,
			symbols: parseSymbols(symbols),
		}).then(({ data: { watchlist } }) => watchlist);
	}

	deleteWatchlist(id) {
		return this.delete(`/watchlists/${id}`).then(
			({ data: { watchlists } }) => watchlists
		);
	}

	addSymbols(id, symbols) {
		return this.post(`/watchlists/${id}/symbols`, {
			symbols: parseSymbols(symbols),
		}).then(({ data: { watchlist } }) => watchlist);
	}

	removeSymbols(id, symbol) {
		return this.delete(`/watchlists/${id}/symbols/${symbol}`).then(
			({ data: { watchlist } }) => watchlist
		);
	}
	// endregion

	// region Streaming
	createSession() {
		return this.post('markets/events/session');
	}

	getEvents(sessionid, symbols, filter, linebreak) {
		return this.post(
			'markets/events',
			{
				sessionid,
				symbols: parseSymbols(symbols),
				filter,
				linebreak,
			},
			{ baseURL: URLS.stream }
		).then(({ data: { data } }) => data);
	}
	// endregion
}


var tradier = new Tradier('yG1tBcGioyqA0J6CA1oW3IJ4svAw', 'sandbox');



function getPositions() {

	var positions = tradier.getPositions(accountNumber);


	positions.then((val) => {
		createPositionTable(val);


	});

}

getPositions();

tradier.getPositions(accountNumber);
tradier.getAccountOrders(accountNumber);


function reLoadOrders() {
	var orders = tradier.getOrders(accountNumber);


	orders.then((val) => {
		createBSTable(val);


	});

}


reLoadOrders();



var strikeWanted = 4375;

var optionSymbol = 'SPXW';

var oType = "C";


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
today = 23 + '' + mm + '' + dd;

var number = strikeWanted * 1000;
let strike = number.toString().padStart(8, '0');

var symbol = optionSymbol + today + oType + strike;


tradier.getQuote(symbol);

var buyToOpenLeg = [];

var tryStrike = strikeWanted;

var trade = tradier;


/*tradier.createOrder(accountNumber, {
	'class': 'multileg',
	'symbol': 'SPY',
	'type': 'credit',
	'duration': 'day',
	'price': '23.2',
	'option_symbol[0]': 'SPY230630C00438000',
	'side[0]': 'sell_to_open',
	'quantity[0]': '1',
	'option_symbol[1]': 'SPY230630C00440000',
	'side[1]': 'buy_to_open',
	'quantity[1]': '1'
});


tradier.createOrder(accountNumber, {
	'class': 'option',
	'symbol': 'SPY',
	'option_symbol': 'SPY230630C00436000',
	'side': 'buy_to_open',
	'quantity': '1',
	'type': 'limit',
	'duration': 'day',
	'price': '30.00',
	'stop': '1.00',
	'tag': today
})
*/
function getStrikeForOption(strikeWanted) {
	var number = strikeWanted * 1000;
	let strike = number.toString().padStart(8, '0');
	return strike;

}




for (var i = 0; (i < 10 && buyToOpenLeg.length == 0); i++) {

	if (oType == "C") {
		tryStrike = tryStrike + 5;
	} else {

		tryStrike = tryStrike - 5;
	}

	var symbol = optionSymbol + today + oType + getStrikeForOption(tryStrike);

	var q = tradier.getQuote(symbol);

	q.then((val) => {
		if (val.ask == .1) {
			buyToOpenLeg.push(val);

		}

	});

}




function createTable(data, id) {


	const theTable = $('#' + id);
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "option_symbol", title: "SYMBOL" },
		{ field: "side", title: "side" },
		{ field: "status", title: "status" },
		{ field: "transaction_date", title: "transaction_date" },

		{ field: "quantity", title: "quantity" },
		{ field: "price", title: "price" },
		{ field: "reason_description", title: "reason_description" },

		{
			field: "tableAction", title: "Action",
			formatter: (value, row, index, field) => {
				curID = row[UNIQUE_ID];
				return [
					`<button type="button" class="btn btn-default btn-sm" onclick="cancelOrder(${curID})">`,
					`<i class="far fa-trash-alt"></i>`,
					`</button>`,


				].join('')
			}
		}
	]

	theTable.bootstrapTable()
	theTable.bootstrapTable('refreshOptions',
		{
			columns: columns,
			//url: "https://jsonplaceholder.typicode.com/photos",
			data: data,
			height: 768,
			uniqueId: "id",
			striped: true,
			pagination: true,
			sortable: true,
			pageNumber: 1,
			pageSize: 200,
			pageList: [10, 25, 50, 100],
			search: true,
			showToggle: true,
			searchHighlight: true,
		}
	)
	theTable.bootstrapTable('refresh')

}

function getRelevantOrders(data, status) {
	var today = new Date();

	var legs = _.pluck(data.account.orders.order, "leg");



	var ndata = _.union(data.account.orders.order, _.flatten(_.compact(legs)));

	_.each(ndata, function(leg) {

		leg.price = (!leg.price) ? leg.avg_fill_price : leg.price;

	});

	myOrders = ndata;

	rdata = _.filter(ndata, function(order) {

		var orderCheck = (order.status == status && !order.leg) ? true : false;

		var cDate = new Date(order.create_date);

		return (cDate.getFullYear() == today.getFullYear() && cDate.getMonth() == today.getMonth() && today.getDate() == cDate.getDate() && orderCheck);



	});

	_.sortBy(rdata, function(o) { return o.transaction_date; });

	return rdata;



}


function createPositionTable(resp) {

	var data = myPositions = resp.account.positions.position;

	_.each(myPositions, (position) => {

		position.cost_basis = (((position.cost_basis / position.quantity)) / 100).toFixed(2);

	});

	const theTable = $('#' + 'Positions');
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "symbol", title: "symbol" },
		{ field: "quantity", title: "QTY" },
		{ field: "cost_basis", title: "trade_price" },
		{ field: "date_acquired", title: "date_acquired" },

		{
			field: "tableAction", title: "Action",
			formatter: (value, row, index, field) => {
				curID = row.id;
				return [

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},.20,'p')">`,
					`| 20 <i class="fa-solid fa-percent"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},.25,'p')">`,
					`| 25 <i class="fa-solid fa-percent"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},.30,'p')">`,
					`| 30 <i class="fa-solid fa-percent"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},1,'d')">`,
					`| 100 <i class="fa-solid fa-dollar-sign"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},2,'d')">`,
					`| 200 <i class="fa-solid fa-dollar-sign"></i> |`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm" onclick="closeAtMarketOrder(${curID})">`,
					`| <i class="fa-solid fa-person-running"></i> | `,
					`</button>`
				].join('')
			}
		}
	]

	theTable.bootstrapTable()
	theTable.bootstrapTable('refreshOptions',
		{
			columns: columns,
			//url: "https://jsonplaceholder.typicode.com/photos",
			data: data,
			height: 768,
			uniqueId: "id",
			striped: true,
			pagination: true,
			sortable: true,
			pageNumber: 1,
			pageSize: 200,
			pageList: [10, 25, 50, 100],
			search: true,
			showToggle: true,
			searchHighlight: true,
		}
	)
	theTable.bootstrapTable('refresh')




}

function createBSTable(data) {

	var canceled = getRelevantOrders(data, 'canceled', 'bs-Cancelled');
	var filled = getRelevantOrders(data, 'filled', 'bs-Filled');
	var pending = getRelevantOrders(data, 'pending', 'bs-Working');
	var rejected = getRelevantOrders(data, 'rejected', 'bs-Rejected');


	createTable(canceled, 'bs-Cancelled');
	createTable(filled, 'bs-Filled');
	createTable(pending, 'bs-Working');
	createTable(rejected, 'bs-Rejected');


}

function closeAtMarketOrder(pId) {


	var position = _.where(myPositions, { 'id': pId })[0];

	var orders = _.where(myOrders, { 'option_symbol': position.symbol, 'status': 'filled' });

	_.each(orders, (order) => {


		tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': 'SPY',
			'option_symbol': order.option_symbol,
			'side': (order.side == 'sell_to_open') ? 'buy_to_close' : 'sell_to_close',
			'quantity': order.quantity,
			'type': 'market',
			'duration': 'day',
			'tag': today
		})


	});



}

function addStopLimitOrder(pId, amt, type) {

	var position = _.where(myPositions, { 'id': pId })[0];

	var orders = _.where(myOrders, { 'option_symbol': position.symbol, 'status': 'filled' });

	_.each(orders, (order) => {

		if (type == 'p') {

			var stop = order.avg_fill_price * (1 + amt);


		} else {

			var stop = order.avg_fill_price + amt

		}
		var limit = stop + .2;
		tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': 'SPY',
			'option_symbol': order.option_symbol,
			'side': (order.side == 'sell_to_open') ? 'buy_to_close' : 'sell_to_close',
			'quantity': order.quantity,
			'type': 'limit',
			'duration': 'day',
			'price': limit.toFixed(2),
			'stop': stop.toFixed(2),
			'tag': today
		})


	});



}

function cancelOrder(orderId) {

	tradier.cancelOrder(accountNumber, orderId);

}




console.log(buyToOpenLeg);



function tradeCall(strike, type) {

	var symbol = 'SPX';


	var dateOfExpiry = todate();



	var values = window.location.href.split('?');

	if (values.length > 0) {
		var vals = window.location.href.split('?')[1].split('|');

		symbol = vals[0];

		if (vals.length > 1) {
			dateOfExpiry = '2023' + '-' + vals[1];

		}

	}


	console.log(today);


	trade(symbol, dateOfExpiry, strike, type);
}

var oldChangeInOICall = {};
var oldChangeInOIPut = {};

var sellToOpen = [];
var buyToOpen = [];
var sellToClose = [];
var buyToClose = [];

function trade(symbol, dateOfExpiry, strike, type) {

	var contenderForBuy = [];
	console.log(symbol, dateOfExpiry, strike, type);


	$.ajax({
		type: 'get',
		url: 'https://sandbox.tradier.com/v1/markets/options/chains',
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
			changeinCall_OI = [];
			changeinPut_OI = [];


			var options = data.options.option;


			options.forEach(function(option, i) {
				if (option.symbol.slice(6).indexOf(type) > -1) {
					if (option.strike == strike) {
						option.strikeLabel = option.strike + '';
						sellToOpen.push(option);
					}


					if (type == "P" && option.strike < strike) {
						if (Math.abs(option.strike - strike) <= 70 && option.ask == .1) {
							contenderForBuy.push(option);
						}
					}


					if (type == "C" && option.strike > strike) {
						if (Math.abs(option.strike - strike) <= 70 && option.ask == .1) {
							contenderForBuy.push(option);
						}
					}
				}



			});


			if (type == "C") {
				buyToOpen.push(_.min(contenderForBuy, function(o) {
					return o.strike;
				})
				);


			} else {
				buyToOpen.push(_.max(contenderForBuy, function(o) {
					return o.strike;
				})
				);
			}



			$.ajax({
				type: 'post',
				url: 'https://sandbox.tradier.com/v1/accounts/VA94962097/orders',
				data: {
					'symbol': 'SPX',
					'class': 'multileg',
					'type': 'credit',
					'duration': 'day',
					'price': '2.05',
					'option_symbol[0]': "SPXW230628C04380000",
					'side[0]': 'sell_to_open',
					'quantity[0]': '1',
					'option_symbol[1]': "SPXW230628C04390000",
					'side[1]': 'buy_to_open',
					'quantity[1]': '1'
				},
				headers: {
					'Authorization': 'Bearer ' + 'yG1tBcGioyqA0J6CA1oW3IJ4svAw',
					'Accept': 'application/json'
				},
				success: function(data, response, code) {

				}
			}

			);


		}
	}

	);
}


function showPutandCallOptions(oc) {

	var last = 4400;

	var putOptions = [];
	var callOptions = [];

	_.each(oc.option, function(option) {

		if (Math.abs(option.strike - last) <= 40) {

			if (option.symbol.slice(6).indexOf("P") > -1) {
				putOptions.push(option);
			} else {
				callOptions.push(option);
			}


		}


	});
	callOptions;


}

function todate() {
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
	return today;

}

$(function() {

	$('#form').submit(function(e) {
		e.preventDefault();
		var symbol = $('#symbol').val();
		tradier.getQuote(symbol);

		var dateOfExpiry = todate();
		var oc = tradier.getOptionChains(symbol, dateOfExpiry);


		oc.then((val) => {
			showPutandCallOptions(val);


		});


	})



});