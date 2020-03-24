import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import AddMovementBar from './components/AddMovementBar';
import MovementsTable from './components/MovementsTable';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import '../static/css/bootstrap_4_3_1.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const styles = {
    root: {
        minWidth: 275,
        margin: '5px',
    }
};

class MainLayout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [{ id: 1 }],
            all_categories: [],
        };
    }

    componentDidMount() {
        let all_movs = 'http://127.0.0.1:5000/all_records';
        let all_categories = 'http://127.0.0.1:5000/categories';

        const requestAllMovs = axios.get(all_movs);
        const requestAllCats = axios.get(all_categories);

        axios
            .all([requestAllMovs, requestAllCats])
            .then(
                axios.spread((...responses) => {
                    const responseAllMovs = responses[0];
                    const responseAllCats = responses[1];

                    this.setState({
                        data: responseAllMovs.data,
                        all_categories: responseAllCats.data,
                    });
                }),
            )
            .catch(errors => {
                console.log(errors);
            });
    }

    handleTableAddRequest = (movement_id, code_item, operator, date_movement, item, category, batch, company, quantity) => {
        var oldData = this.state.data;

        // reformat date in yyyy-mm-dd
        let date_temp = date_movement['date_movement'];
        let date_temp_tokens = date_temp.split('/');
        let date_new = date_temp_tokens[2] + '-' + date_temp_tokens[1] + '-' + date_temp_tokens[0];

        oldData.unshift({
            id: movement_id,
            code_item: code_item['code_item'],
            operator: operator['operator'],
            date_movement: date_new,
            item: item['item'],
            category: category['category'],
            batches: batch['batch'],
            company: company['company'],
            quantity: quantity['quantity'],
        });
        this.setState({ data: oldData });
    };

    handleTableDelete = movement_id => {
        var filteredData = this.state.data.filter(el => el.id !== movement_id);
        this.setState({ data: filteredData });
    };

    handleTableEdit = movement_id => {
        // var filteredData = this.state.data.filter(el => el.id !== movement_id);
        // this.setState({ data: filteredData });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid container spacing={0}>
                    <Grid container item xs={8} spacing={0} padding={10}>
                        <Card className={classes.root}>
                            <CardContent>
                                <AddMovementBar all_categories={this.state.all_categories} onTableAddRequest={this.handleTableAddRequest} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid container item xs={12} spacing={0} padding={10}>
                        <Card className={classes.root}>
                            <CardContent>
                                <MovementsTable data={this.state.data} onTableDelete={this.handleTableDelete} onTableEdit={this.handleTableEdit} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* <div style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}> */}
                {/* <AddMovementBar all_categories={this.state.all_categories} onTableAddRequest={this.handleTableAddRequest} /> */}
                {/* </div> */}
                {/* <h5>
                    {' '}
                    Row Count: <span className="badge">{this.state.rowCount}</span>
                </h5> */}
                {/* <div style={{ borderRadius: '0.25em', textAlign: 'center', color: 'purple', border: '1px solid purple', padding: '0.5em' }}> */}
                {/* <MovementsTable data={this.state.data} onTableDelete={this.handleTableDelete} onTableEdit={this.handleTableEdit} /> */}
                {/* </div> */}
            </div>
        );
    }
}

const StyledMainLayout = withStyles(styles)(MainLayout);
ReactDOM.render(<StyledMainLayout />, document.getElementById('root'));
