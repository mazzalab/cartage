import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import AddMovementBar from './components/AddMovementBar';
import MovementsTable from './components/MovementsTable';


class MainLayout extends React.Component {
    _isMounted = false;


    constructor(props) {
        super(props);

        this.state = {
            categories: [],
            companies: [],
            operators_maintable: [],
            
            rowCount: 10,
            bordered_row_id: -1,

            cancel_color: 'secondary',
            edit_color: 'primary',
            done_color: 'gray'
        }
    }

    

    

    onTableAdd = (code_item, operator, date_movement, item, category, batch, company, quantity) => {
        var oldData = this.state.data;
        oldData.push({
            code_item: code_item['code_item'], operator: operator['operator'], date_movement: date_movement['date_movement'], item: item['item'],
            category: category['category'], batch: batch['batch'], company: company['company'], quantity: quantity['quantity']
        });
        this.setState({ data: oldData });
    }

    render() {
        return (
            <div>
                {/* <div style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}> */}
                < AddMovementBar /> {/* onTableModifyRequest=handleTableModifyRequest /> */}
                {/* </div> */}
                < h5 > Row Count: <span className="badge">{this.state.rowCount}</span></h5 >
                < MovementsTable onTableAdd={this.onTableAdd} />
            </div>
        )
    }
}


ReactDOM.render(
    <MainLayout />,
    document.getElementById('root')
);

// module.hot.accept();