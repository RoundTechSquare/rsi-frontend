import React, { useEffect, useState } from "react";
import logo from "../../logo.svg";
import "./AdminDashboard.css";
import fetch from "node-fetch";
import { Redirect } from "react-router-dom";
import "react-input-range/lib/css/index.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import socketIOClient from "socket.io-client";
import Cookies from "js-cookie";
import BellIcon from "react-bell-icon";
import moment from "moment";

const TIMEFRAMES = ["60min", "4h", "1d", "1w"];

const AdminDashboard = (props) => {
     const [state,setState] = useState({
      selectedTab: "60min",
      bellActive: false,
      redirect: false,
      verified: false,
      filtersResult: {
        price: { min: 1, max: 10000000, on: false },
        volume: { min: 1, max: 1000000, on: false },
        float: { min: 1, max: 1000000, on: false },
      },
      tabData: [],
      filters: {
        "60min": {
          marketCap: {
            min: 50,
            max: 100,
          },
          price: {
            min: 1,
            max: 2,
          },
          volume: {
            min: 1,
            max: 2,
          },
        },
        "4h": {
          marketCap: {
            min: 50,
            max: 100,
          },
          price: {
            min: 1,
            max: 2,
          },
          volume: {
            min: 1,
            max: 2,
          },
        },
        "1d": {
          marketCap: {
            min: 50,
            max: 100,
          },
          price: {
            min: 1,
            max: 2,
          },
          volume: {
            min: 1,
            max: 2,
          },
        },
        "1w": {
          marketCap: {
            min: 50,
            max: 100,
          },
          price: {
            min: 1,
            max: 2,
          },
          volume: {
            min: 1,
            max: 2,
          },
        },
        "1m": {
          marketCap: {
            min: 50,
            max: 100,
          },
          price: {
            min: 1,
            max: 2,
          },
          volume: {
            min: 1,
            max: 2,
          },
        },
        "3m": {
          marketCap: {
            min: 50,
            max: 100,
          },
          price: {
            min: 1,
            max: 2,
          },
          volume: {
            min: 1,
            max: 2,
          },
        },
      },
      history: {
        "60min": {},
        "4h": {},
        "1d": {},
        "1w": {},
        "3m": {},
        "1m": {},
      },
      sortingDescending: true,
      alerts: [],
      alertsCopy: [],
      showNotifications: false,
      selectedDate: new Date(),
    });

  const isValidAlert = (alert) => {
    if (!alert.float) {
      return false;
    }
    let filters =  state.filters;
    if (
      parseInt(alert.float) <
        parseInt(filters[ state.selectedTab].float.min) ||
      parseInt(alert.float) >
        parseInt(filters[ state.selectedTab].float.max)
    ) {
      return false;
    }
    return true;
  }

  const handlePriceCheckboxChangeResult =()=> {
    let priceFilters =  state.filtersResult;
    priceFilters.price.on = !priceFilters.price.on;
     setState({
      ... state,
      filtersResult: priceFilters,
    });
  }

  const handleFloatCheckboxChangeResult =()=> {
    let floatFilters =  state.filtersResult;
    floatFilters.float.on = !floatFilters.price.on;
     setState({
      ... state,
      filtersResult: floatFilters,
    });
  }

  const handleVolumeCheckboxChangeResult =()=> {
    let volumeFilters =  state.filtersResult;
    volumeFilters.volume.on = !volumeFilters.price.on;
     setState({
      ... state,
      filtersResult: volumeFilters,
    });
  }

  const  dateChanged = (date) => {
     setState({
      ... state,
      selectedDate: date,
    });
  }

  const  clearFiltersResult= ()=> {
     setState({
      ... state,
      history:  state.alertsCopy,
    });
  }

  const setSortedField=(key)=> {
    // const selectedDate =  state.selectedDate;
    const formattedDate = moment( state.selectedDate).format('DD-MM-yyyy')


    let sorted =  state.history[ state.selectedTab][formattedDate];
    let history =  state.history;
    sorted.sort((a, b) => {
      if (a[key]) {
        if (b[key])  
          if (key === "date")
            return (
              parseFloat(Date.parse(a[key])) - parseFloat(Date.parse(b[key]))
            );
          else if (key === "type" || key === "ticker") {
            if (a[key] < b[key]) return -1;
            else if (a[key] > b[key]) return 1;
          } else return parseFloat(a[key]) - parseFloat(b[key]);
        else return 1;
      } else if (b[key]) {
        return -1;
      }
      return 0;
    });
    if ( state.sortDescending) {
      sorted.reverse();
    }
     state.history[ state.selectedTab][formattedDate] = sorted;
     setState({
      ... state,
      history,
      sortDescending: ! state.sortDescending,
    });
  }

  const updateAlertComment =(timeframe, date, ticker, alertDate, index) => {
    fetch(
      window.location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        window.location.port +
        "/api/admin/scanner/stocks/updateComment?timeframe=" +
        timeframe +
        "&date=" +
        date +
        "&ticker=" +
        ticker +
        "&alertDate=" +
        alertDate,
      {
        method: "post",
        body: JSON.stringify( state.history[timeframe][date][index]),
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const handleAlertCommentChange =(timeframe, date, index, value) =>{
    let state =  state;
    state.history[timeframe][date][index].comment = value;
     setState(state);
  }
  const handleMarketCapMinFilterChange=(value) =>{
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].marketCap.min = parseInt(
      value.target.value
    );
     setState({
      ... state,
      filters,
    });
  }
  const handleMarketCapMaxFilterChange = (value)=> {
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].marketCap.max = parseInt(
      value.target.value
    );
     setState({
      ... state,
      filters,
    });
  }

  const handleVolumeMinFilterChange=(value)=> {
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].volume.min = parseInt(value.target.value);
     setState({
      ... state,
      filters,
    });
  }
  const handleVolumeMaxFilterChange =(value)=> {
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].volume.max = parseInt(value.target.value);
     setState({
      ... state,
      filters,
    });
  }

  const handlePriceMinFilterChange =(value) =>{
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].price.min = parseInt(value.target.value);
     setState({
      ... state,
      filters,
    });
  }
  const handlePriceMaxFilterChange = (value) =>{
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].price.max = parseInt(value.target.value);
     setState({
      ... state,
      filters,
    });
  }

  const handleFloatMinFilterChange =(value)=> {
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].float.min = parseInt(value.target.value);
     setState({
      ... state,
      filters,
    });
  }
 const handleFloatMaxFilterChange =(value)=> {
    let filters =  state.filters;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filters[ state.selectedTab].float.max = parseInt(value.target.value);
     setState({
      ... state,
      filters,
    });
  }

  const handleFloatMinFilterChangeResult = (value)=>{
    let filtersResult =  state.filtersResult;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filtersResult.float.min = parseInt(value.target.value);
     setState({
      ... state,
      filtersResult,
    });
  }
  const handleFloatMaxFilterChangeResult=(value)=>{
    let filtersResult =  state.filtersResult;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filtersResult.float.max = parseInt(value.target.value);
     setState({
      ... state,
      filtersResult,
    });
  }
  const handleVolumeMinFilterChangeResult =(value)=> {
    let filtersResult =  state.filtersResult;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filtersResult.volume.min = parseInt(value.target.value);
     setState({
      ... state,
      filtersResult,
    });
  }
  const handleVolumeMaxFilterChangeResult=(value)=> {
    let filtersResult =  state.filtersResult;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filtersResult.volume.max = parseInt(value.target.value);
     setState({
      ... state,
      filtersResult,
    });
  }

  const handlePriceMinFilterChangeResult =(value)=> {
    let filtersResult =  state.filtersResult;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filtersResult.price.min = parseInt(value.target.value);
     setState({
      ... state,
      filtersResult,
    });
  }
  const handlePriceMaxFilterChangeResult =(value)=> {
    let filtersResult =  state.filtersResult;
    if (value.target.value === "") {
      value.target.value = "0";
    }
    filtersResult.price.max = parseInt(value.target.value);
     setState({
      ... state,
      filtersResult,
    });
  }

  const updateFilters =(event) =>{
    event.preventDefault();
    fetch(
      window.location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        window.location.port +
        "/api/admin/scanner/filters/update?timeframe=" +
         state.selectedTab,
      {
        method: "post",
        body: JSON.stringify( state.filters[ state.selectedTab]),
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const updateFiltersResult=(event)=> {
    event.preventDefault();
    const alerts =  state.alertsCopy;
    let filters =  state.filtersResult;
    let newAlerts = {};

    for (let i = 0; i < Object.keys(alerts).length; i++) {    
      const timeframe = alerts[Object.keys(alerts)[i]];
      newAlerts[Object.keys(alerts)[i]] = {};
      for (let y = 0; y < Object.keys(timeframe).length; y++) {
        let date = timeframe[Object.keys(timeframe)[y]];

        date = date.filter((x) => {
          if (x.price) x.price = parseFloat(x.price);
          if (x.averageVolume) x.volume = parseFloat(x.averageVolume);
          return (
            (x.price || !filters.price.on) &&
            (x.volume || !filters.volume.on) &&
            ((x.price >= filters.price.min && x.price <= filters.price.max) ||
              !filters.price.on) &&
            ((x.volume >= filters.volume.min &&
              x.volume <= filters.volume.max) ||
              !filters.volume.on)
          );
        });
        newAlerts[Object.keys(alerts)[i]][Object.keys(timeframe)[y]] = date;
      }
    }
     setState({
      ... state,
      alertsCopy: alerts,
      history: newAlerts,
    });
  }

  const renderRedirect = () => {
    if ( state.redirect) {
      return <Redirect to="/login" />;
    }
  }
useEffect(()=>{
  document.title = "Admin Dashboard - WhatsThisCrypto";
  const socket = socketIOClient(
    "ws://" + window.location.hostname + ":3000",
    {
      query: {
        token: Cookies.get("token"),
      },
      transport: ["websocket"],
    }
  );
  socket.on("connect", () => {
    console.log("connected");
  });
  socket.on("message", (alert) => {
    let history =  state.history;
    let formattedDate = new Date();
    formattedDate =
      formattedDate.getDate() +
      "-" +
      parseInt(formattedDate.getMonth() + 1) +
      "-" +
      formattedDate.getFullYear();
    if (!history[alert.timeframe][formattedDate])
      history[alert.timeframe][formattedDate] = [];
    history[alert.timeframe][formattedDate].push({
      ticker: alert.ticker,
      type: alert.type,
      exchange: alert.exchange,
      date: alert.date,
      comment: "",
    });
    let alerts =  state.alerts;
    alerts.push({
      ticker: alert.ticker,
      timeframe: alert.timeframe,
    });

     setState({
      ... state,
      history,
      alertsCopy: history,
      bellActive: true,
      alerts,
    });
    setTimeout(() => {
       updateFiltersResult();
    }, 1000);
    setTimeout(() => {
       setState({
        ... state,
        bellActive: false,
      });
    }, 5000);
  });
  // fetch(
  //   window.location.protocol +
  //     '//' +
  //     window.location.hostname +
  //     ':' +
  //     window.location.port +
  //     '/api/admin/ping'
  // ).then((response) => {
  //   if (response.status === 401 &&  state.redirect !== true) {
  //      setState({
  //       ... state,
  //       redirect: true,
  //     });
  //   } else if (response.status === 200) {
  //     fetch(
  //       window.location.protocol +
  //         '//' +
  //         window.location.hostname +
  //         ':' +
  //         window.location.port +
  //         '/api/admin/scanner/filters'
  //     )
  //       .then((result) => result.json())
  //       .then((result) => {
  //         console.log(result, 'RESULT');
  //          setState({
  //           ... state,
  //           verified: true,
  //           filters: result,
  //         });
  //       });
  //     fetch(
  //       window.location.protocol +
  //         '//' +
  //         window.location.hostname +
  //         ':' +
  //         window.location.port +
  //         '/api/admin/scanner/history'
  //     )
  //       .then((result) => result.json())
  //       .then((result) => {
  //         console.log('test');
  //         console.log(result);
  //          setState({
  //           ... state,
  //           history: result,
  //           alertsCopy: result,
  //         });
  //       });
  //   }
  // });
   getData("60min");
  console.log("state",  state);
},[''])
  const  getData = async(params) =>{
    const data = await fetch(`http://iodigitalbot.com/api/data?tf=${params}`);
    const result = await data.json();
    // console.log(result,  state.history);
    //   gives an object with dates as keys
    const groups = result.reduce((groups, game) => {
      // console.log(groups,game)
      let date = moment(game.date).format("DD-MM-yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(game);
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        data: groups[date],
      };
    });
    console.log(groupArrays)
    let updatedHistory = []
    groupArrays.map((obj)=>{
      if(obj !== "Invalid date"){
        updatedHistory[`${obj.date}`] = obj.data
      }
    })
     state.history[params] = updatedHistory;
     setState({
      ... state,
      alerts:  state.history,
      alertsCopy:  state.history,

    });
  }
    const redirect =  renderRedirect();
    let notificationsList;
    if ( state.showNotifications) {
      notificationsList = (
        <section className="notificationsList">
          <h2>Notifications:</h2>
          { state.alerts.map((alert, index) => {
            return (
              <div key={index}>
                <p>
                  {alert.ticker} on {alert.timeframe}
                </p>
                <button
                  onClick={() => {
                    let alerts =  state.alerts;
                    alerts.splice(index, 1);
                     setState({
                      ... state,
                      alerts,
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </section>
      );
    }
    return (
      <section className="container">
        {redirect}
        <div className="heading">
          <h1 className="adminDashboardTitle">Admin Dashboard</h1>
          <BellIcon
            className="bellIcon"
            // onClick={() => {
            //    setState({
            //     ... state,
            //     showNotifications: ! state.showNotifications,
            //   });
            // }}
            width="40"
            active={ state.bellActive}
            animate={ state.bellActive}
          />
          {notificationsList}
        </div>
        <form onSubmit={ updateFilters}>
          <div className="allFiltersContainer">
            <section className="filtersSection">
              <label>
                <span>Min Market Captialisation</span>
                <input
                  type="number"
                  max={ state.filters[ state.selectedTab].marketCap.max}
                  value={
                     state.filters[ state.selectedTab].marketCap.min
                  }
                  onChange={ handleMarketCapMinFilterChange}
                ></input>
              </label>
              <label>
                <span>Max Market Captialisation</span>
                <input
                  type="number"
                  min={ state.filters[ state.selectedTab].marketCap.min}
                  value={
                     state.filters[ state.selectedTab].marketCap.max
                  }
                  onChange={ handleMarketCapMaxFilterChange}
                ></input>
              </label>
            </section>

            <section className="filtersSection">
              <label>
                <span>Min Average Volume</span>
                <input
                  type="number"
                  max={ state.filters[ state.selectedTab].volume.max}
                  value={ state.filters[ state.selectedTab].volume.min}
                  onChange={ handleVolumeMinFilterChange}
                ></input>
              </label>
              <label>
                <span>Max Average Volume</span>
                <input
                  type="number"
                  min={ state.filters[ state.selectedTab].volume.min}
                  value={ state.filters[ state.selectedTab].volume.max}
                  onChange={ handleVolumeMaxFilterChange}
                ></input>
              </label>
            </section>

            <section className="filtersSection">
              <label>
                <span>Min Price</span>
                <input
                  type="number"
                  max={ state.filters[ state.selectedTab].price.max}
                  value={ state.filters[ state.selectedTab].price.min}
                  onChange={ handlePriceMinFilterChange}
                ></input>
              </label>
              <label>
                <span>Max Price</span>
                <input
                  type="number"
                  min={ state.filters[ state.selectedTab].price.min}
                  value={ state.filters[ state.selectedTab].price.max}
                  onChange={ handlePriceMaxFilterChange}
                ></input>
              </label>
            </section>

            <section className="filtersSection">
              <label>
                <span>Min Float</span>
                <input
                  type="number"
                  max={ state.filters[ state.selectedTab].float?.max}
                  value={ state.filters[ state.selectedTab].float?.min}
                  onChange={ handleFloatMinFilterChange}
                ></input>
              </label>
              <label>
                <span>Max Float</span>
                <input
                  type="number"
                  min={ state.filters[ state.selectedTab].float?.min}
                  value={ state.filters[ state.selectedTab].float?.max}
                  onChange={ handleFloatMaxFilterChange}
                ></input>
              </label>
            </section>
          </div>

          <button className="updateFiltersButton" type="submit">
            Update filters
          </button>
        </form>
        <form onSubmit={ updateFiltersResult}>
          <div className="allFiltersContainer">
            <section className="filtersSection">
              <label>
                <span>Enable filtering alerts by float</span>
                <input
                  type="checkbox"
                  onClick={ handleVolumeCheckboxChangeResult}
                />
              </label>
              <label>
                <span>Min Float</span>
                <input
                  type="number"
                  max={ state.filtersResult.float.max}
                  value={ state.filtersResult.float.min}
                  onChange={ handleFloatMinFilterChangeResult}
                ></input>
              </label>
              <label>
                <span>Max Float</span>
                <input
                  type="number"
                  min={ state.filtersResult.float.min}
                  value={ state.filtersResult.float.max}
                  onChange={ handleFloatMaxFilterChangeResult}
                ></input>
              </label>
            </section>
            <section className="filtersSection">
              <label>
                <span>Enable filtering alerts by volume</span>
                <input
                  type="checkbox"
                  onClick={ handleVolumeCheckboxChangeResult}
                />
              </label>
              <label>
                <span>Min Average Volume</span>
                <input
                  type="number"
                  max={ state.filtersResult.volume.max}
                  value={ state.filtersResult.volume.min}
                  onChange={ handleVolumeMinFilterChangeResult}
                ></input>
              </label>
              <label>
                <span>Max Average Volume</span>
                <input
                  type="number"
                  min={ state.filtersResult.volume.min}
                  value={ state.filtersResult.volume.max}
                  onChange={ handleVolumeMaxFilterChangeResult}
                ></input>
              </label>
            </section>

            <section className="filtersSection">
              <label>
                <span>Enable filtering alerts by price</span>
                <input
                  type="checkbox"
                  onClick={ handlePriceCheckboxChangeResult}
                />
              </label>
              <label>
                <span>Min Price</span>
                <input
                  type="number"
                  max={ state.filtersResult.price.max}
                  value={ state.filtersResult.price.min}
                  onChange={ handlePriceMinFilterChangeResult}
                ></input>
              </label>
              <label>
                <span>Max Price</span>
                <input
                  type="number"
                  min={ state.filtersResult.price.min}
                  value={ state.filtersResult.price.max}
                  onChange={ handlePriceMaxFilterChangeResult}
                ></input>
              </label>
            </section>
          </div>

          <button className="updateFiltersButton" type="submit">
            Update filters
          </button>

          <button
            type="reset"
            className="updateFiltersButton"
            onClick={ clearFiltersResult}
          >
            Clear alerts filters
          </button>
        </form>
        <h1>Results filter</h1>
        <section>
          <DatePicker
            selected={ state.selectedDate}
            onChange={ dateChanged}
          />
          <Tabs
            onSelect={(tab) => {
               setState({
                ... state,
                selectedTab: Object.keys( state.history)[tab],
              });
            }}
          >
            <TabList>
              {Object.keys( state.history).map((timeframe) => {
                return (
                  <Tab
                    onClick={() => {
                       getData(timeframe);
                    }}
                    key={timeframe}
                  >
                    {timeframe}
                  </Tab>
                );
              })}
            </TabList>

            {Object.values( state.history).map(
              (objects, timeframeIndex) => {
                const formattedDate = moment( state.selectedDate).format('DD-MM-yyyy')
                if (!objects[formattedDate]) {
                  return (
                    <TabPanel key={timeframeIndex}>
                      <p>No alerts for selected date.</p>
                    </TabPanel>
                  );
                }
                return (
                  <TabPanel key={timeframeIndex}>
                    <table className="alertsTable">
                      <thead>
                        <tr>
                          <th>
                            <button
                              type="button"
                              onClick={() =>  setSortedField("date")}
                            >
                              Time
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() =>  setSortedField("type")}
                            >
                              Signal
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() =>  setSortedField("ticker")}
                            >
                              Symbol
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() =>  setSortedField("price")}
                            >
                              Price
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() =>
                                 setSortedField("averageVolume")
                              }
                            >
                              Volume
                            </button>
                          </th>
                          <th>
                            <button
                              type="button"
                              onClick={() =>  setSortedField("date")}
                            >
                              Float
                            </button>
                          </th>
                        </tr>
                        {/* {JSON.stringify( state)} */}
                      </thead>
                      {/* <div>aas</div> */}
                      <tbody>
                        {objects[formattedDate].map((alert, index) => {
                          let formattedAlertTime = new Date(alert.date);
                          formattedAlertTime =
                            formattedAlertTime.getHours() +
                            ":" +
                            formattedAlertTime.getMinutes();
                          const timeframe = Object.keys( state.history)[
                            timeframeIndex
                          ];

                          return (
                            <tr key={index}>
                              <td>Bar close on {formattedAlertTime} UTC</td>
                              <td>Hidden {alert.type} divergence</td>
                              <td>
                                <a
                                  target="_blank"
                                  href={
                                    "https://www.tradingview.com/chart/?symbol=" +
                                    alert.exchange +
                                    ":" +
                                    alert.ticker
                                  }
                                >
                                  {alert.ticker}
                                </a>
                              </td>
                              <td>{alert.price}</td>
                              <td>
                                {alert.averageVolume
                                  ? alert.averageVolume
                                      .toFixed(0)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  : ""}
                              </td>
                              <td>{alert.float}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </TabPanel>
                );
              }
            )}
          </Tabs>
        </section>
      </section>
    );
  }

export default AdminDashboard;
