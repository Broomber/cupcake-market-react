import React from "react";
import axios from "axios";
import { baseUrl, marketsList } from "./marketApi";
import './CurrencyTable.css';

class CurrencyTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marketsData: [],
      marketsList: marketsList,
      smallestValuesMarkets: [
        { id: 0, name: 'RUB', marketId: null, value: Infinity },
        { id: 1, name: 'USD', marketId: null, value: Infinity },
        { id: 2, name: 'EUR', marketId: null, value: Infinity },
        { id: 3, name: 'RUB/USD', marketId: null, value: Infinity },
        { id: 4, name: 'RUB/EUR', marketId: null, value: Infinity },
        { id: 5, name: 'USD/EUR', marketId: null, value: Infinity }
      ]
    };

    // this.handleClick = this.handleClick.bind(this);
  }

  fetchDataByMarketId(marketId, isFirstCall) {
    let marketItem = this.state.marketsList.find(market => market.id === marketId);
    let apiString = isFirstCall ? `${baseUrl}/${marketItem.slug}` : `${baseUrl}/${marketItem.slug}/poll`
    axios
      .get(apiString)
      .then(response => {
        this.updateMarketData(marketItem, response)
      })
      .catch(error => {
        console.error(error);
      })
      .then(() => {
        isFirstCall = false;
        this.fetchDataByMarketId(marketId, isFirstCall)
      });
  }

  getCurrencyValueByMarketId(marketId, currency) {
    let upperCurrency = currency.toUpperCase();
    let currencyValue = 0;

    switch (currency) {
      case "RUB/USD":
        currencyValue = this.state.marketsData.find(market => market.id === marketId).data.rates.RUB/this.state.marketsData.find(market => market.id === marketId).data.rates.USD;
        break;
      case "RUB/EUR":
        currencyValue = this.state.marketsData.find(market => market.id === marketId).data.rates.RUB/this.state.marketsData.find(market => market.id === marketId).data.rates.EUR;
        break;
      case "EUR/USD":
        currencyValue = this.state.marketsData.find(market => market.id === marketId).data.rates.EUR/this.state.marketsData.find(market => market.id === marketId).data.rates.USD;
        break;
      default:
        currencyValue = this.state.marketsData.find(market => market.id === marketId).data.rates[upperCurrency];
        break;
    }

    // return this.state.marketsData.find(market => market.id === marketId).data.rates[upperCurrency];
    return currencyValue
  }

  setSmallestValueMarketId() {
    let smallestValuesMarkets = [...this.state.smallestValuesMarkets];

    // Clear previous values in smallestValuesMarkets array
    smallestValuesMarkets.forEach((item, index) => {
      item.marketId = null;
      item.value = Infinity;
    })

    this.state.marketsData.forEach((market, index) => {
      // Finding smallest value and marketID in each pair
      if (market.data.rates.RUB < smallestValuesMarkets[0].value) {
        smallestValuesMarkets[0].value = market.data.rates.RUB;
        smallestValuesMarkets[0].marketId = market.id;
      }
      if (market.data.rates.USD < smallestValuesMarkets[1].value) {
        smallestValuesMarkets[1].value = market.data.rates.USD;
        smallestValuesMarkets[1].marketId = market.id;
      }
      if (market.data.rates.EUR < smallestValuesMarkets[2].value) {
        smallestValuesMarkets[2].value = market.data.rates.EUR;
        smallestValuesMarkets[2].marketId = market.id;
      }
      if (market.data.rates.RUB/market.data.rates.USD < smallestValuesMarkets[3].value) {
        smallestValuesMarkets[3].value = market.data.rates.RUB/market.data.rates.USD;
        smallestValuesMarkets[3].marketId = market.id;
      }
      if (market.data.rates.RUB/market.data.rates.EUR < smallestValuesMarkets[4].value) {
        smallestValuesMarkets[4].value = market.data.rates.RUB/market.data.rates.EUR;
        smallestValuesMarkets[4].marketId = market.id;
      }
      if (market.data.rates.EUR/market.data.rates.USD < smallestValuesMarkets[5].value) {
        smallestValuesMarkets[5].value = market.data.rates.EUR/market.data.rates.USD;
        smallestValuesMarkets[5].marketId = market.id;
      }
    })

    this.setState(state => ({
      smallestValuesMarkets
    }));
  }

  updateMarketData(marketItem, response) {
    let marketIsInStore = this.state.marketsData.find(market => market.id === marketItem.id);
    if (marketIsInStore) {
      let marketsData = this.state.marketsData.map((market) => {
        if (market.id !== marketItem.id) {
          return market
        } else {
          return {...market, data: response.data};
        }
      })
      this.setState({marketsData});
    } else {
      this.setState(state => ({
        marketsData: state.marketsData.concat({id: marketItem.id, data: response.data})
      }));

    }
    this.setSmallestValueMarketId();
  }

  componentDidMount() {
    this.state.marketsList.forEach((market, index) => {
      this.fetchDataByMarketId(market.id, true);
    })
  }

  render() {
    let tableHead = this.state.marketsList.map((market) =>
      <th key={market.id}>{market.name}</th>
    );

    return (
      <div className="currency-table-wrapper">
        <table className="currency-table">
          <thead>
            <tr>
              <th>Pair name/market</th>
              {tableHead}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>RUB/CUPCAKE</td>
              {this.state.marketsData.map((market) =>
                <td
                  key={market.id}
                  className={market.id === this.state.smallestValuesMarkets[0].marketId ? 'smallest' : '' }
                >{this.getCurrencyValueByMarketId(market.id, "RUB").toFixed(2)}</td>
              )}
            </tr>
            <tr>
              <td>USD/CUPCAKE</td>
              {this.state.marketsData.map((market) =>
                <td
                  key={market.id}
                  className={market.id === this.state.smallestValuesMarkets[1].marketId ? 'smallest' : '' }
                >{this.getCurrencyValueByMarketId(market.id, "USD").toFixed(2)}</td>
              )}
            </tr>
            <tr>
              <td>EUR/CUPCAKE</td>
              {this.state.marketsData.map((market) =>
                <td
                  key={market.id}
                  className={market.id === this.state.smallestValuesMarkets[2].marketId ? 'smallest' : '' }
                >{this.getCurrencyValueByMarketId(market.id, "EUR").toFixed(2)}</td>
              )}
            </tr>
            <tr>
              <td>RUB/USD</td>
              {this.state.marketsData.map((market) =>
                <td
                  key={market.id}
                  className={market.id === this.state.smallestValuesMarkets[3].marketId ? 'smallest' : '' }
                >{this.getCurrencyValueByMarketId(market.id, "RUB/USD").toFixed(3)}</td>
              )}
            </tr>
            <tr>
              <td>RUB/EUR</td>
              {this.state.marketsData.map((market) =>
                <td
                  key={market.id}
                  className={market.id === this.state.smallestValuesMarkets[4].marketId ? 'smallest' : '' }
                >{this.getCurrencyValueByMarketId(market.id, "RUB/EUR").toFixed(2)}</td>
              )}
            </tr>
            <tr>
              <td>EUR/USD</td>
              {this.state.marketsData.map((market) =>
                <td
                  key={market.id}
                  className={market.id === this.state.smallestValuesMarkets[5].marketId ? 'smallest' : '' }
                >{this.getCurrencyValueByMarketId(market.id, "EUR/USD").toFixed(3)}</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default CurrencyTable;
