import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import AddMovementBar from './components/AddMovementBar';
import MovementsTable from './components/MovementsTable';


class MainLayout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [{ 'id': 1 }]
        }
    }

    componentDidMount() {
        this._isMounted = true;

        axios.get("http://127.0.0.1:5000/")
            .then(response => {
                // if (this._isMounted) {
                this.setState({ data: response.data });
                // }
            }).catch(err => {
                console.log(err);
            });
    }

    handleTableAddRequest = (code_item, operator, date_movement, item, category, batch, company, quantity) => {
        var oldData = this.state.data;
        oldData.push({
            code_item: code_item['code_item'], operator: operator['operator'], date_movement: date_movement['date_movement'], item: item['item'],
            category: category['category'], batches: batch['batch'], company: company['company'], quantity: quantity['quantity']
        });
        this.setState({ data: oldData });
    }

    handleTableDelete = (movement_id) => {
        var filteredData = this.state.data.filter(el => el.id !== movement_id);
        this.setState({ data: filteredData });
    }

    handleTableEdit =  (movement_id) => {
        // var filteredData = this.state.data.filter(el => el.id !== movement_id);
        // this.setState({ data: filteredData });
    }

    render() {
        return (
            <div>
                {/* <div style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}> */}
                < AddMovementBar onTableAddRequest={this.handleTableAddRequest} />
                {/* </div> */}
                < h5 > Row Count: <span className="badge">{this.state.rowCount}</span></h5 >
                < MovementsTable data={this.state.data} onTableDelete={this.handleTableDelete} onTableEdit={this.handleTableEdit}/>
            </div>
        )
    }
}


ReactDOM.render(
    <MainLayout />,
    document.getElementById('root')
);

// module.hot.accept();