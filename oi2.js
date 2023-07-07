
var globalsymbol = 'SPX';
var defaultQty = 1;
var percentofOppo = .5;


var minincrement = {

	'SPY': 1,
	'QQQ': 1,
	'IWM': 1,
	'SPX': 5,
	'RUT': 5,
	'TSLA': 2.5

}


var buyLegMinimum = {

	'SPX': .1,
	'RUT': .1,
	'IWM': .01,
	'SPY': .01,
	'QQQ': .01,
	'TSLA': 1

};


var minimumCredit = {

	'SPX': 1.1,
	'RUT': 1,
	'IWM': .11,
	'SPY': .11,
	'QQQ': .11,
};


var reloadOrderInterval = 2000000;

var accountNumber = 'VA94962097';
var prodaccountNumber = '6YA26930';
var apiKey = 'yG1tBcGioyqA0J6CA1oW3IJ4svAw';
var prodApiKey = 'OqRWQhNJZc1ZvPrFc53etOAA3XAY';

var access = localStorage.getItem('access');

var myPositions, myOrders;

function urlstringify(data) {

	var url = Object.keys(data).map(function (k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
	}).join('&');

	return url;
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

	tooltipItems.forEach(function (tooltipItem) {
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


var tradier = new Tradier(apiKey, 'sandbox');
var prodtradier = new Tradier(prodApiKey, 'prod');
var prodtradier = tradier;



function getPositions() {

	var positions = tradier.getPositions(accountNumber);




	positions.then((resp) => {

		var positions = [];
		if (!_.isArray(resp.account.positions.position)) {
			resp.account.positions.position = [resp.account.positions.position];
		}


		_.each(resp.account.positions.position, (position) => {

			if (Math.abs(position.quantity) == 1) {
				positions.push(position);
			} else {

				for (var count = 0; count < Math.abs(position.quantity); count++) {

					var p = _.clone(position);
					p.quantity = (position.quantity < 0) ? (-1 * defaultQty) : defaultQty;
					positions.push(p);
				}


			}

		});

		createPositionTable(positions);


	});

}



function reLoadOrders() {
	var orders = tradier.getOrders(accountNumber);

	orders.then((val) => {
		createBSTable(val);


	});

}

reLoadOrders();
//setInterval(reLoadOrders, reloadOrderInterval);




var trade = tradier;


/*tradier.createOrder(accountNumber, {
	'class': 'multileg',
	'symbol': globalsymbol,
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
	'symbol': globalsymbol,
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
function generateOptionSymbol(strike, oType) {


	let expiration = new Date();
	// Extract the year, month, and day from the expiration date
	const year = expiration.getFullYear().toString().substr(-2);
	const month = (expiration.getMonth() + 1).toString().padStart(2, '0');
	let day = expiration.getDate().toString().padStart(2, '0');

	// Convert the strike price to a string and remove decimal point and leading zeros
	let strikeStr = strike.toFixed(3).replace('.', '');

	strikeStr = "00000000".substring(strikeStr.length) + strikeStr;

	var ggOp = (globalsymbol == 'SPX') ? 'SPXW' : globalsymbol;

	// Combine the symbol, year, month, day, and strike to form the option symbol
	let optionSymbol = `${ggOp}${year}${month}${day}${oType}${strikeStr}`;

	return optionSymbol;
}







function createTable(data, id) {


	const theTable = $('#' + id);
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "parentOrderId", title: "Parent Order Id" },
		{ field: "option_symbol", title: "SYMBOL" },
		{ field: "strike", title: "strike" },

		{ field: "type", title: "Call or Put" },
		{ field: "quantity", title: "quantity" },

		{ field: "price", title: "price" },
		{ field: "side", title: "side" },
		{ field: "status", title: "status" },
		{ field: "transaction_date", title: "transaction_date" },


		{ field: "reason_description", title: "Reason" },

		{
			field: "tableAction", title: "Actions",
			formatter: (value, row, index, field) => {
				var parentid = (row['parentOrderId']) ? row['parentOrderId'] : row[UNIQUE_ID];
				var curID = row[UNIQUE_ID];
				var oType = row.type;
				return [
					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="cancelOrder(${parentid})">`,
					`<i class="far fa-trash-alt"></i>`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="cancelOrder(${curID})">`,
					`(Just This)`,
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

	var orders = data.account.orders.order;

	if (!_.isArray(data.account.orders.order)) {

		orders = [data.account.orders.order];

	}


	_.each(orders, (order) => {

		if (order.leg) {

			_.each(order.leg, (leg) => {

				leg.parentOrderId = order.id;

			})

		}


	});


	var legs = _.pluck(orders, "leg");



	var ndata = _.union(orders, _.flatten(_.compact(legs)));

	_.each(ndata, function (leg) {

		leg.price = (!leg.price) ? leg.avg_fill_price : leg.price;


	});

	myOrders = ndata;

	rdata = _.filter(ndata, function (order) {

		var orderCheck = (order.status == status && !order.leg) ? true : false;

		var cDate = new Date(order.create_date);

		return (cDate.getFullYear() == today.getFullYear() && cDate.getMonth() == today.getMonth() && today.getDate() == cDate.getDate() && orderCheck);



	});

	_.each(rdata, function (leg) {

		leg.quantity = (leg.side.indexOf('sell') > -1) ? leg.quantity * -1 : leg.quantity;

		leg.type = (leg.option_symbol.slice(6).indexOf("C") > -1) ? "CALL" : "PUT";

		leg.strike = parseInt(leg.option_symbol.slice(-8)) / 1000;


	});

	_.sortBy(rdata, function (o) { return o.transaction_date; });

	return rdata;



}


function createPositionTable(positions) {


	var data = myPositions = positions;

	if (!data) {

		data = [];
	}

	_.each(data, (position) => {

		position.cost_basis = (((position.cost_basis / position.quantity)) / 100).toFixed(2);
		position.type = (position.symbol.slice(6).indexOf("C") > -1) ? "CALL" : "PUT";
		position.strike = parseInt(position.symbol.slice(-8)) / 1000;
	});

	const theTable = $('#' + 'Positions');
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "symbol", title: "symbol" },
		{ field: "strike", title: "strike" },
		{ field: "type", title: "Call/PUT" },
		{ field: "quantity", title: "QTY" },
		{ field: "cost_basis", title: "trade_price" },
		{ field: "date_acquired", title: "date_acquired" },

		{
			field: "tableAction", title: "Action",
			formatter: (value, row, index, field) => {
				curID = row.id;
				var oType = row.type;
				return [

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.20,'p')">`,
					`|20 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.25,'p')">`,
					`|25 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.30,'p')">`,
					`|30 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.50,'p')">`,
					`|50 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},1,'d')">`,
					`|100 <i class="fa-solid fa-dollar-sign"></i>|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},2,'d')">`,
					`|200 <i class="fa-solid fa-dollar-sign"></i>|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},0,'d')">`,
					`|(stop limit@cost basis)|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},0,'d', true)">`,
					`|(close @cost basis)|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="closeAtAsk(${curID})">`,
					`|(close @ ask)|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="match50OfThis(${curID})">`,
					`|(Match ~ @50 of opposite)|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="closeAtMarketOrder(${curID})">`,
					`|(close @ market)| `,
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


var timer = null;
function createBSTable(data) {

	if (data != 'null') {

		var canceled = getRelevantOrders(data, 'canceled', 'bs-Cancelled');
		var filled = getRelevantOrders(data, 'filled', 'bs-Filled');
		var pending = getRelevantOrders(data, 'pending', 'bs-Working');
		var open = getRelevantOrders(data, 'open', 'bs-Working');
		var rejected = getRelevantOrders(data, 'rejected', 'bs-Rejected');
		var expired = getRelevantOrders(data, 'expired', 'bs-Rejected');

		pending = _.union(pending, open);
		rejected = _.union(expired, rejected);






		if (pending.length) {


			if (timer != null) {
				window.clearInterval(timer);
				timer = null;
				timer = window.setInterval(reLoadOrders, reloadOrderInterval);
			}
			else {
				timer = window.setInterval(reLoadOrders, reloadOrderInterval);
			}

		} else {

			if (timer != null) {
				window.clearInterval(timer);
				timer = null;

			}
		}
		createTable(canceled, 'bs-Cancelled');
		createTable(filled, 'bs-Filled');
		createTable(pending, 'bs-Working');
		createTable(rejected, 'bs-Rejected');
	}


}

function closeAtMarketOrder(pId) {


	var position = _.where(myPositions, { 'id': pId })[0];

	var orders = _.where(myOrders, { 'option_symbol': position.symbol, 'status': 'filled' });

	if (/*orders.length*/false) {

		_.each(orders, (order) => {


			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': order.option_symbol,
				'side': (order.side == 'sell_to_open') ? 'buy_to_close' : 'sell_to_close',
				'quantity': Math.abs(order.quantity),
				'type': 'market',
				'duration': 'day',
				'tag': todate()
			});


			order.then(resp => {
				getPositions();
				showResponse(resp);


			}).catch((err) => {
				showResponse(err);
			})


		});

	} else {


		var order = tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': globalsymbol,
			'option_symbol': position.symbol,
			'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
			'quantity': Math.abs(position.quantity),
			'type': 'market',
			'duration': 'day',
			'tag': todate()
		});


		order.then(resp => {
			getPositions();
			showResponse(resp);


		}).catch((err) => {
			showResponse(err);
		})
	}





}


function match50OfThis(pId) {

	var positionToClose = _.where(myPositions, { 'id': pId })[0];


	var oppositeside = _.filter(myPositions, (position) => {

		return (position.quantity < 0 && position.symbol != positionToClose.symbol);


	});

	oppositeside = oppositeside[0];

	var query = oppositeside.symbol;


	if (positionToClose.symbol.slice(6).indexOf("C") > -1) {
		var oType = "C";
	} else {
		var oType = "P";
	}

	tryStrike = Math.floor((positionToClose.symbol.slice(-7) / 1000) / minincrement[globalsymbol]) * minincrement[globalsymbol];


	var incrementBy = minincrement[globalsymbol];


	for (var i = 0; i < 30; i++) {
		if (oType == "C") {
			tryStrike = tryStrike + incrementBy;
		} else {

			tryStrike = tryStrike - incrementBy;
		}

		query = query + ',' + generateOptionSymbol(tryStrike, oType);

	}



	var q = prodtradier.getQuote(query);




	q.then(val => {

		var contenders = [];

		var thisSide = _.where(val, { 'symbol': oppositeside.symbol })[0];

		var askOfThis = thisSide.ask;

		var threshhold = askOfThis * percentofOppo;

		_.each(val, (option) => {

			if (option.bid <= threshhold && option.symbol != oppositeside.symbol) {

				contenders.push(option);

			}


		});


		if (oType == "C") {
			contenders = _.sortBy(contenders, (b) => { return b.strike });
		} else {

			contenders = _.sortBy(contenders, (b) => { return -b.strike });
		}

		var chosenOne = contenders[0];


		var limitPrice = (askOfThis - chosenOne.bid) * .95;


		var order = tradier.createOrder(accountNumber, {
			'class': 'multileg',
			'symbol': globalsymbol,
			'type': 'market',
			'duration': 'day',
			'price': limitPrice.toFixed(2),
			'option_symbol[0]': positionToClose.symbol,
			'side[0]': 'buy_to_close',
			'quantity[0]': defaultQty,
			'option_symbol[1]': chosenOne.symbol,
			'side[1]': 'sell_to_open',
			'quantity[1]': defaultQty,
			'tag': todate()
		});


		order.then(resp => {
			showResponse(resp);

		}).catch((err) => {
			showResponse(err);
		})


	});




}



function closeAtAsk(pId) {

	var position = _.where(myPositions, { 'id': pId })[0];

	var q = prodtradier.getQuote(position.symbol);

	q.then((val) => {

		var order = tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': globalsymbol,
			'option_symbol': position.symbol,
			'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
			'quantity': Math.abs(position.quantity),
			'type': 'limit',
			'duration': 'day',
			'price': (val.ask * .95).toFixed(2),
			'stop': (val.ask * .95).toFixed(2),
			'tag': todate()
		});



		order.then(resp => {


			showResponse(resp);


		}).catch((err) => {


			showResponse(err);
		})

	});

}

function addStopLimitOrder(pId, amt, type, l) {

	var position = _.where(myPositions, { 'id': pId })[0];

	var orders = _.where(myOrders, { 'option_symbol': position.symbol, 'status': 'filled' });

	if (false) {

		_.each(orders, (order) => {

			if (type == 'p') {

				var stop = order.avg_fill_price * (1 + amt);


			} else {

				var stop = order.avg_fill_price + amt

			}
			var limit = stop + (stop * .05);
			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': order.option_symbol,
				'side': (order.side == 'sell_to_open') ? 'buy_to_close' : 'sell_to_close',
				'quantity': order.quantity,
				'type': 'stop_limit',
				'duration': 'day',
				'price': limit.toFixed(2),
				'stop': stop.toFixed(2),
				'tag': todate()
			})


			order.then(resp => {
				getPositions();
				showResponse(resp);


			}).catch((err) => {
				showResponse(err);
			})

		});
	}

	else {

		if (type == 'p') {

			var stop = parseFloat(position.cost_basis) * (1 + amt);


		} else {

			var stop = parseFloat(position.cost_basis) + amt

		}


		var limit = stop + (stop * .05);

		var order = tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': globalsymbol,
			'option_symbol': position.symbol,
			'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
			'quantity': Math.abs(position.quantity),
			'type': (l) ? 'limit' : 'stop_limit',
			'duration': 'day',
			'price': limit.toFixed(2),
			'stop': stop.toFixed(2),
			'tag': todate()
		});



		order.then(resp => {

			showResponse(resp);


		}).catch((err) => {

			showResponse(err);
		})
	}


}

function cancelOrder(orderId) {

	var order = tradier.cancelOrder(accountNumber, orderId);

	order.then(resp => {

		showResponse(resp);


	}).catch((err) => {
		showResponse(err);
	})

}







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


function showResponse(resp) {

	if (resp.status == 'ok') {
		$.toastr.success(JSON.stringify(resp));


	} else {

		try {
			$.toastr.error("--" + resp.response.data);
		} catch (e) {

			$.toastr.error("--" + e + '---ERROR - please check network tab asap >> respo = ' + resp);

		}

	}

	getPositions();
	reLoadOrders();

};


function showErrorMsg(resp) {



	$.toastr.error("!!!  " + resp + "  !!!");


};

var isBuySideWanted = $('#buyHedges').is(':checked');

function placeSpreadOrder(symbol, strikeChosen) {

	var tryStrike = parseFloat(strikeChosen);
	isBuySideWanted = $('#buyHedges').is(':checked');
	isBuyMarket = !$('#buy-limit').is(':checked');

	var query = symbol;
	if (isBuySideWanted) {



		if (symbol.slice(6).indexOf("C") > -1) {
			var oType = "C";
		} else {
			var oType = "P";
		}

		var incrementBy = minincrement[globalsymbol];

		var oPrefix = symbol.slice(0, 11);


		for (var i = 0; i < 30; i++) {

			if (oType == "C") {
				tryStrike = tryStrike + incrementBy;
			} else {

				tryStrike = tryStrike - incrementBy;
			}


			query = query + ',' + generateOptionSymbol(tryStrike, oType);

		}
	}



	var q = prodtradier.getQuote(query);



	q.then(val => {

		if (isBuySideWanted) {
			var sellSide = _.where(val, { 'symbol': symbol })[0];
		} else {
			var sellSide = val;

		}
		if (isBuySideWanted) {

			var buySide = _.filter(val, (oc) => {

				return oc.ask <= buyLegMinimum[globalsymbol];

			});



			if (oType == "C") {
				buySide = _.sortBy(buySide, (b) => { return b.strike });
			} else {

				buySide = _.sortBy(buySide, (b) => { return -b.strike });
			}


			buySide.length == 0 ? showErrorMsg('no buyside with price ' + buyLegMinimum[globalsymbol] + ' found') : '';

			var price = sellSide.bid - buySide[0].ask;

			price = price * .99;


			var order = tradier.createOrder(accountNumber, {
				'class': 'multileg',
				'symbol': globalsymbol,
				'type': (isBuyMarket) ? 'market' : 'credit',
				'duration': 'day',
				'price': price.toFixed(2),
				'option_symbol[0]': sellSide.symbol,
				'side[0]': 'sell_to_open',
				'quantity[0]': defaultQty,
				'option_symbol[1]': buySide[0].symbol,
				'side[1]': 'buy_to_open',
				'quantity[1]': defaultQty,
				'tag': todate()
			})
		}

		else {

			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': sellSide.symbol,
				'side': 'sell_to_open',
				'quantity': defaultQty,
				'type': (isBuyMarket) ? 'market' : 'limit',
				'duration': 'day',
				'price': (sellSide.bid * .99).toFixed(2),
				'tag': todate()
			});





		}


		order.then((resp, data, xyx, hsh) => {

			order;

			showResponse(resp);


		}).catch((err) => {
			showResponse(err);
		})



	});


}




function makeButtons(cName, options) {

	$('.' + cName).empty();

	if (cName.indexOf('call') >= 0) {

		var btnClass = ' btn btn-success ';
	} else {

		var btnClass = ' btn btn-danger ';
	}

	_.each(options, function (option) {


		$('.' + cName).append('<button class="' + btnClass + option.strike + ' ' + '" onclick=placeSpreadOrder("' + option.symbol + '","' + option.strike + '") value=' + option.symbol + '><b>$' + option.strike + "</b>-" + option.bid + "/" + option.ask + " " +
			'</button>');


	});

}

var last = 4400;
function showPutandCallOptions(oc, resp) {

	$('.call-button-holder').empty();
	$('.put-button-holder').empty();

	var putOptions = [];
	var callOptions = [];

	var percent = (isBuySideWanted) ? .02 : .03;

	if (oc) {
		_.each(oc.option, function (option) {

			if (Math.abs(option.strike - last) <= percent * last) {

				if (option.symbol.slice(6).indexOf("P") > -1) {
					putOptions.push(option);
				} else {
					callOptions.push(option);
				}
			}


		});
		makeButtons('call-button-holder', callOptions);
		makeButtons('put-button-holder', putOptions.reverse());


		var strikeChosen = Math.floor(last / minincrement[globalsymbol]) * minincrement[globalsymbol];

		$('.' + strikeChosen).each(function () {
			$(this).removeClass().addClass("btn btn-warning");
		});
	} else {
		showErrorMsg("No Option Chain Found")

	}

}



var latest = null;
var quoteRefresh = 1000000;


function getLatestQuote() {
	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = q.last;
			$('#lastquote').html(last);
		}

		var dateOfExpiry = todate();
		var oc = prodtradier.getOptionChains(globalsymbol, dateOfExpiry);


		oc.then((val, resp) => {
			showPutandCallOptions(val, resp);
		});

	});
}


function sellStraddle(e) {
	e.preventDefault();
	globalsymbol = $('#symbol').val();


	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = q.last;
			$('#lastquote').html(last);
		}

		var strikeChosen = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];


		var callSymbol = generateOptionSymbol(strikeChosen, "C");
		var putSymbol = generateOptionSymbol(strikeChosen, "P");
		placeSpreadOrder(callSymbol, strikeChosen);
		placeSpreadOrder(putSymbol, strikeChosen);

	});
}

sellStrangle = (type) => {

	globalsymbol = $('#symbol').val();


	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = q.last;
			$('#lastquote').html(last);
		}

		var strikeChosen = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];

		var symbol = generateOptionSymbol(strikeChosen, type);

		placeStrangleLeg(symbol, strikeChosen);

	})
}



function placeStrangleLeg(symbol, strikeChosen) {

	var tryStrike = parseFloat(strikeChosen);
	isBuySideWanted = $('#buyHedges').is(':checked');
	isBuyMarket = !$('#buy-limit').is(':checked');


	var query = symbol;

	if (symbol.slice(6).indexOf("C") > -1) {
		var oType = "C";
	} else {
		var oType = "P";
	}

	var incrementBy = minincrement[globalsymbol];



	for (var i = 0; i < 30; i++) {

		if (oType == "C") {
			tryStrike = tryStrike + incrementBy;
		} else {

			tryStrike = tryStrike - incrementBy;
		}


		query = query + ',' + generateOptionSymbol(tryStrike, oType);

	}




	var q = prodtradier.getQuote(query);



	q.then(val => {



		var sellSide = _.filter(val, (oc) => {

			return Math.abs(oc.bid >= minimumCredit[globalsymbol])


		});


		sellSide = _.sortBy(sellSide, (oc) => {

			return Math.abs(oc.bid - minimumCredit[globalsymbol])


		});

		sellSide = sellSide[0];



		var buySide = _.filter(val, (oc) => {

			return oc.ask <= buyLegMinimum[globalsymbol];

		});



		if (oType == "C") {
			buySide = _.sortBy(buySide, (b) => { return b.strike });

		} else {

			buySide = _.sortBy(buySide, (b) => { return -b.strike });
		}


		buySide.length == 0 ? showErrorMsg('no buyside with price ' + buyLegMinimum[globalsymbol] + ' found') : '';

		if (buySide.length && sellSide) {

			var price = sellSide.bid - buySide[0].ask;


			var order = tradier.createOrder(accountNumber, {
				'class': 'multileg',
				'symbol': globalsymbol,
				'type': (isBuyMarket) ? 'market' : 'credit',
				'duration': 'day',
				'price': price.toFixed(2),
				'option_symbol[0]': sellSide.symbol,
				'side[0]': 'sell_to_open',
				'quantity[0]': defaultQty,
				'option_symbol[1]': buySide[0].symbol,
				'side[1]': 'buy_to_open',
				'quantity[1]': defaultQty,
				'tag': todate()
			})




			order.then((resp, data, xyx, hsh) => {

				order;

				showResponse(resp);


			}).catch((err) => {
				showResponse(err);
			})
		} else {

			showErrorMsg('no price  found for ' + oType);
		}


	});


}



$(function () {

	getPositions();

	//null.s;

	$('#sell-straddle').click(sellStraddle);
	$('#sell-starangle').click(() => { sellStrangle('C'); sellStrangle('P'); });
	$('#strangle-call').click(() => { sellStrangle('C') });
	$('#strangle-put').click(() => { sellStrangle('P') });

	$('#get-oc').click(function (e) {
		e.preventDefault();
		isBuySideWanted = $('#buyHedges').is(':checked');

		globalsymbol = $('#symbol').val();

		getLatestQuote();

		if (latest != null) {
			window.clearInterval(latest);
			latest = null;
			latest = window.setInterval(getLatestQuote, quoteRefresh);
		}
		else {
			latest = window.setInterval(getLatestQuote, quoteRefresh);
		}






	})
	$('#get-oc').click();


});