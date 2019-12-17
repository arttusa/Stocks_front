import React, {Component} from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  } from 'recharts';
import './ComponentStyles/Chart.css'



class Chart extends Component {

    
    render() {
    let dataNumbers = this.props.chartValues.map(item => Number(item.value));

    let maxValue = Math.max(...dataNumbers);
    let minValue = Math.min(...dataNumbers);
    minValue = minValue >> 0; //tällä pyöristetään minimiarvo alaspäin
    maxValue = Math.ceil(maxValue)

    return (
        <>
            <ResponsiveContainer width="60%" className="Chart" > 
                <LineChart  data={this.props.chartValues}
                    margin={{ top: 15, right: 40, left: -15, bottom: 15 }}>
                    <CartesianGrid vertical={false}
                        stroke="#ebf3f0" />
                    <XAxis dataKey="date" stroke="black" />
                    <YAxis domain={[minValue, maxValue]} stroke="black" />
                    <Tooltip />
                    <Line dataKey="value" stroke="#8984d8" dot={false} strokeWidth="0.5%" />
                </LineChart>
            </ResponsiveContainer >
        </>

    )
    }
}

export default Chart;