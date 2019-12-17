import React from 'react';  
import './ComponentStyles/Addstock.css';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';

// Mikäli halutaan lisätä osakkeita tietokantaan, tämän classin voi ottaa käyttöön

class Addstock extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            textName: '',
            textSymbol: ''
        }
    }

    onTextChangeName = (event) => {
        const value = event.target.value;
        this.setState({ textName: value });
    }
    onTextChangeSymbol = (event) => {
        const value = event.target.value;
        this.setState({ textSymbol: value });
    }

    handleSubmit = () => {
        // Testihaku, jotta voidaan heti kärkeen määrittää pystytäänkö lisäämään serverille
        let url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${this.state.textSymbol}&interval=5min&apikey=GRGKUYP2GB4HI904`;
        const stock = {
            name: this.state.textName,
            symbol: this.state.textSymbol
        }
        // Käsitellään tyhjät 
        if(stock.name === "" || stock.symbol === "") {
            alert("Textfields shouldn't be empty. Try again.")
        }
        
        axios.get(url)
            .then(res => {
                const data = res.data;
                if (data['Meta Data']['2. Symbol'] === this.state.textSymbol) {
                    axios.post(`http://localhost:3001/api`, stock)
                        .then(response => {
                            // Jos halutaan tehdä jotain responsella 
                            alert('Submit was succesful! Now you can find the stock from search.')
                        })
                        .catch(function (error) {
                            // Käsitellään duplikaattierror
                            if (error.response.data.error === 'DUPLICATE') {
                               alert('Stock is already in database.')
                            }
                            

                          })
                }
            })
            .catch(function (error) {
                alert('Stock information can not be found. Try again.');
                return;
            })
    }

    render () {
        return (
            <div>
                <p className="Infotext"> Here you can add a stock to our database </p>
                <div className="Inputsection"> 
                    <TextField 
                        className="Textfield"
                        id="standard-basic"
                        value={this.state.textName}
                        onChange={this.onTextChangeName}
                        label="Name"
                        margin="normal"
                        />

                    <TextField 
                        className="Textfield"
                        id="standard-basic"
                        value={this.state.textSymbol}
                        onChange={this.onTextChangeSymbol}
                        label="Symbol"
                        margin="normal"
                        />
                    <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                        Submit
                    </Button>
                </div>
            </div>
        )
    }
}

export default Addstock;