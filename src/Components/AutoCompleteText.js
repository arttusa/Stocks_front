import React from 'react';
import './ComponentStyles/AutoCompleteText.css';


export default class AutoCompleteText extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
            suggestions: [],
            text: ''
        }
    }

    onTextChanged = (e) => {
        const { items } = this.props;
        const value = e.target.value;
        let suggestions = [];
        if(value.length> 0) {
            const regex = new RegExp(`^${value}`, 'i');
            suggestions = items.sort().filter(v => regex.test(v));
            
        }
        this.setState(() => ({ suggestions, text: value }));
    }

    suggestionSelected (value) {
        this.setState(() => ({
            text: '',
            suggestions: []
        }))
        this.props.callbackFromApp(value);
    }

    renderSuggestions () {
        const { suggestions } = this.state;
        if (suggestions.length === 0) {
            return null;
        }
        return (
            <ul >
                {suggestions.map((item) => <li key={item} onClick={() => this.suggestionSelected(item)}> {item} </li>)}
            </ul>
        )
        




    }

    render () {
        const { text } = this.state;
        return (
            <div className="AutoCompleteText"> 
                <input value={text} onChange={this.onTextChanged} type="text" />
                {this.renderSuggestions()}
            </div>
        )
    }                      
                    
}