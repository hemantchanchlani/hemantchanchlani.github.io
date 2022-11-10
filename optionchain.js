var t = new Tradier();
let quote = null;
var symbol;
let lastPrice;
let purchasePrice = 0;
function getOptionChain() {
	var deferred = $.Deferred();
	let state = {
		quotes: [],
		dateWiseCalls: {},
		dateWisePuts: {},
		priceWisePuts: {},
		priceWiseCalls: {}
	}

	symbol = sessionStorage.getItem('symbol');
	$.when(t.getQuote(symbol)).then(function(q) {




		quote = q.quote;
		lastPrice = quote.last;
		if ($('#price').val()) {

			purchasePrice = parseFloat($('#price').val());

		} else {

			purchasePrice = lastPrice;
		}

		$('#symbol-label').html(quote.symbol + ":" + quote.description);
		$('#purchasePrice').html('$' + purchasePrice);
		$('#lastPrice').html('$' + lastPrice);
		$('.price-info').show();
		$.when(t.getOptionExpirations(symbol)).then(function(expiryDates) {
			var requests = [];
			var deferreds = [];

			for (i = 0; i < expiryDates.length; i++) {
				deferreds.push(t.getOptionChains(symbol, expiryDates[i], requests));
			}
			$.when.apply(undefined, deferreds).then(function() {

				var optionChain = [].concat.apply([], requests);


				optionChain.forEach((option, index) => {

					var expirationDate = option.expiration_date;

					var lengthOfSymbol = symbol.length;

					if (option.symbol.slice(6).indexOf('C') > -1) {

						if (option.strike >= purchasePrice) {


							//****CALL STARTS ***********

							option.amountLost = (lastPrice + option.last - option.strike).toFixed(2);
							option.percentLost = (100 * (option.amountLost / (lastPrice + option.last))).toFixed(2);
							option.capitalInvested = (lastPrice + option.last).toFixed(2);
							if (option.strike <= lastPrice) {
								option.intrinsicValue = (lastPrice - option.strike).toFixed(2);
								option.timeValue = (option.last - option.intrinsicValue).toFixed(2);

							} else {
								option.intrinsicValue = 0;
								option.timeValue = (option.last - option.intrinsicValue).toFixed(2);

							}



							// Create a JSON FOR date and strike start

							if (state.dateWiseCalls[expirationDate]) {




								state.dateWiseCalls[expirationDate].push(option);
								//state.dateWiseCalls[expirationDate][option.strike].push(option);




							} else {
								state.dateWiseCalls[expirationDate] = [];
								state.dateWiseCalls[expirationDate].push(option);

							}

							//this.setState({ dateWiseCalls: state.dateWiseCalls });


							// Create a JSON FOR date  and strike end


							// Create a JSON FOR price and datewise start

							if (state.priceWiseCalls[option.strike]) {
								state.priceWiseCalls[option.strike].push(option);

							} else {
								state.priceWiseCalls[option.strike] = [];
								state.priceWiseCalls[option.strike].push(option);

							}

							//this.setState({ priceWiseCalls: state.priceWiseCalls });


							// Create a JSON FOR price and datewise end



							// CALL ends

							option.last = option.bid;

						}

					} else {


						option.last = option.ask;
						//****PUT

						option.amountLost = (purchasePrice + option.last - option.strike).toFixed(2);
						option.percentLost = (100 * (option.amountLost / (purchasePrice + option.last))).toFixed(2);
						option.capitalInvested = (purchasePrice + option.last).toFixed(2);
						if (option.strike >= lastPrice) {
							option.intrinsicValue = (option.strike - lastPrice).toFixed(2);
							option.timeValue = (option.last - option.intrinsicValue).toFixed(2);

						} else {
							option.intrinsicValue = 0;
							option.timeValue = (option.last - option.intrinsicValue).toFixed(2);

						}

						if (lastPrice < option.strike) {


							// Create a JSON FOR date and strike start

							if (state.dateWisePuts[expirationDate]) {




								state.dateWisePuts[expirationDate].push(option);
								//state.dateWisePuts[expirationDate][option.strike].push(option);




							} else {
								state.dateWisePuts[expirationDate] = [];
								state.dateWisePuts[expirationDate].push(option);

							}

							//this.setState({ dateWisePuts: state.dateWisePuts });


							// Create a JSON FOR date  and strike end


							// Create a JSON FOR price and datewise start

							if (state.priceWisePuts[option.strike]) {
								state.priceWisePuts[option.strike].push(option);

							} else {
								state.priceWisePuts[option.strike] = [];
								state.priceWisePuts[option.strike].push(option);

							}

							//this.setState({ priceWisePuts: state.priceWisePuts });


							// Create a JSON FOR price and datewise end

						}



						// PUT ends
					}


				});




				deferred.resolve(state);



			});

		});

	});

	return deferred.promise();
}