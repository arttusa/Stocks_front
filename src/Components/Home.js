import React from 'react';  
import axios from 'axios'
import './ComponentStyles/Home.css'
import Chart from './Chart'
import AutoCompleteText from './AutoCompleteText';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import CircularProgress from '@material-ui/core/CircularProgress';
import Githublogo from './Media/Githublogo.png';
import Githublogo_hover from './Media/Githublogo_hover.png';

/** Lasketaan annettujen arvojen muutos ja palautetaan luku prosentteina
 * 
 */
const countStockChange = (end, start) => {
  return ( 100 * ((end - start)/start)).toFixed(2);
}

// Tätä muutetaan kun backend on AWS:llä pyörimässä 'https://osakeseuranta.net'
// Jos halutaan tehdä muokkauksia, käytetään 'http://localhost:3001'
const baseUrl = 'https://osakeseuranta.net';
                   
class Home extends React.Component {
  
    constructor(props) {
        super(props)
        this.state = {
          currentStock: "",
          currentStockChange: "",  
          values: [],
          stockListFromApi: [],
          stockList: [],
          isLoading: true
        }
    }

      /** Metodissa "kysytään" AutoCompleteText luokalta hakukenttään päätyneen pörssiyhtiön nimeä ja asetetaan kyseinen pörssiyhtiö stockList -taulukkoon ja local storageen.
       * 
       */
      getStockFromSearchBar = (dataFromSearch) => {
        const stock = this.state.stockListFromApi.find(item => item['name'] === dataFromSearch);

        // Testataan, että API -kutsu on onnistunut
        if (JSON.parse(stock.values).length === 0) {
          alert(`Valitettavasti osakkeen tiedoissa on ongelma. Kokeile jotain toista osaketta.`)
          return;
        }

        // Testataan vielä duplikaatit ennen lisäämistä
        if(this.state.stockList.find(item => item.symbol === stock.symbol)) {
          alert(`${stock.name} on jo listalla. Valitse toinen osake.`)
          return;
        } 

        // Mikäli ei duplikaatteja, hoidetaan lisäys sekä local storageen että stateen
        let updatedStockList = this.state.stockList;
        updatedStockList.push(stock)
        localStorage.setItem('stockList', JSON.stringify(updatedStockList));
        this.handleStockChange(stock.id)
        this.setState({ stockList: updatedStockList })
      }
    
      /** Metodissa poistetaan item -parametrina annettu objekti tallennetusta salkusta
       * 
       */
      handleDelete = (item) =>  {
        // Etsitään indeksin mukaan kyseinen yksilö listasta
        const index = this.state.stockList.indexOf(item)
        let updatedStockList = this.state.stockList
        updatedStockList.splice(index, 1);
        // Lisätään päivitetyt tiedot sekä stateen että local storageen
        localStorage.setItem('stockList', JSON.stringify(updatedStockList));
        this.setState({ stockList: updatedStockList })
      }
                           
      /** Metodissa haetaan halutun pörssiyhtiön kurssitiedot stockListFromAPI -taulukosta ja asetetaan ne values- ja currentStock muuttujien arvoiksi.
       * 
       *
       */
      handleStockChange = (id) => {
        const stock = this.state.stockListFromApi.find(item => item['id'] === id);
        // Lasketaan osakkeen aikavälin mukainen muutos
        const stockValues = JSON.parse(stock.values);
        const endValue = stockValues[stockValues.length - 1].value;
        const startValue = stockValues[0].value;
        let stockChangeValue = countStockChange(endValue, startValue);
        stockChangeValue += "%"

        this.setState({ values: stockValues, currentStockChange: stockChangeValue, currentStock: stock.name })
      }

      /** Metodissa asetetaan annetun listan ensimmäinen alkio näkyväksi aloitussivulla 
       *  Käytetään vain componentDidMount() metodissa
       */
      setStartStock = (list) => {
        const stock = list[0];
        const stockValues = JSON.parse(stock.values);
        const endValue = stockValues[stockValues.length - 1].value;
        const startValue = stockValues[0].value;
        let stockChangeValue = countStockChange(endValue, startValue);
        stockChangeValue += "%"

        const stockInHandle = stock.name;
        this.setState({ values: stockValues, currentStockChange: stockChangeValue, currentStock: stockInHandle })
      
      }


      /** Metodi saa parametriksi local storagessa tällä hetkellä olevan listan ja API:sta haetun listan ja asettaa tuoreet arvot
       *  local storageen, mikäli arvot ovat muuttuneet
       * 
       */
      refreshLocalStorage = (listLocal, listAPI) => {
        // Tarkistetaan päivämäärän mukaan onko tiedot tuoreita
        const dateAPI = JSON.parse(listAPI[0].values)[0].date;
        const dateLocal = JSON.parse(listLocal[0].values)[0].date;
        if (dateAPI !== dateLocal) {
          for (let i = 0; i < listLocal.length; i++) {
            const stockInAPI = listAPI.find(item => item.id === listLocal[i].id)
            listLocal[i].values = stockInAPI.values
          }
          localStorage.setItem('stockList', JSON.stringify(listLocal));
        }
        this.setState({ stockList: listLocal, isLoading: false })
        console.log(this.state.isLoading)
        // Asetetaan ensimmäinen osake aloitusnäkymäksi sivulle
        this.setStartStock(listLocal)
      }

    
      /** Metodissa haetaaan baseUrl osoitteessa olevalta serveriltä data API:ssa olevista pörssiyhtiöistä ja asetetaan ne yksilöittäin stockListFromApi -taulukkoon.
       *  Asetetaan myös paikallisesti tallennettu data stocklist -taulukkoon, mikäli sellaista löytyy.
       */
      componentDidMount = () => {
        // Seuraavaa käytetään tuotantovaiheessa, jos halutaan tyhjentää paikallisesti tallennettu data
        //localStorage.clear(); 
        
        const savedStockList = JSON.parse(localStorage.getItem('stockList'))
        console.log(savedStockList)
        if (savedStockList === null || savedStockList.length === 0) {
            this.setState({ isLoading: false })
        }

        const baseUrlAPI = `${baseUrl}/api`;
        axios.get(baseUrlAPI).then( (response) => {

          if (savedStockList !== null) {
            // Tuplatsekkaus, sillä savedStocklist voi olla sekä tyhjä että sen pituus voi olla 0
            if (savedStockList.length !== 0) {
              this.refreshLocalStorage(savedStockList, response.data)
            }
          }

          this.setState({ stockListFromApi: response.data })
        }) 
        
        
        
      }
    
      /** Metodissa asetetaan näkyviin stockList taulukko, mikäli taulukko ei ole tyhjä.
       *  
       */
      renderStockList = () => {
        if (this.state.stockList.length === 0 || this.state.stockList === 0) {
          return null;
        }
        
        return (
          <ul> 
            {this.state.stockList.map(item => <li key = {item.id}> <button className="Listobject"  onClick = {() => this.handleStockChange(item.id)} > {item.name} </button> <DeleteForeverIcon onClick = {() => this.handleDelete(item)} className="Deletebutton" /> </li>)}
          </ul>
        )
      }


      renderMain = () => {
        if (this.state.stockList.length !== 0 && this.state.isLoading === false) {
          return (
            <>
            <div className="Headers">
              <p className="Stockheader"> {this.state.currentStock} </p> 
              <p className="Stockpercentage" style={{color: Number(this.state.currentStockChange.substring(0, this.state.currentStockChange.length -1)) >= 0 ? "green" : "red"}} > {this.state.currentStockChange} </p>
            </div>
            <>
              <div className="Container">
              <div className="Stocklist">
                {this.renderStockList()}
            </div>
              <Chart chartValues = {this.state.values}  />
            </div>
            <div className="Addstock">
              <p> Lisää osake </p>
              <AutoCompleteText items={this.state.stockListFromApi.map(item => item.name)} callbackFromApp={this.getStockFromSearchBar}/>     
            </div>  
            </>
            </>
          )
        }
        else if (this.state.isLoading === false) { 
          return (
            <>
              <h1> Osakeseuranta </h1>
              <div className="Mainstarter">
                <div className="Infobox">
                    <p> Lisää osake seurantalistaan käyttämällä hakupalkkia. Osakkeeksi on mahdollista valita mikä tahansa Helsingin
                      pörssin osakkeista. </p> 
                </div>  
                <div className="AddstockStarter">
                  <p> Lisää osake </p>
                  <AutoCompleteText items={this.state.stockListFromApi.map(item => item.name)} callbackFromApp={this.getStockFromSearchBar}/>
                </div> 
              </div>
            </>
          )
        }
        else {
          return (
            <div className="Loading">
              <CircularProgress disableShrink />
            </div>
          )
        }
      }

      render() {
        return (
          <>
            <a href="https://github.com/arttusa/Stocks" target="_blank" rel="noopener noreferrer">
              <img className="Githublogo" src={Githublogo} alt="Github Logo"
                onMouseOver={e => (e.currentTarget.src = Githublogo_hover)} 
                onMouseOut={e => (e.currentTarget.src = Githublogo)} />
            </a>
            {this.renderMain()}
          </>
        )
      }
    
}
export default Home;