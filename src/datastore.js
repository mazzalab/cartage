import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import InfoPaper from './components/InfoPaper';
import AddMovementBar from './components/AddMovementBar';
import MovementsTable from './components/MovementsTable';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import '../static/css/bootstrap_4_3_1.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const styles = {
    userInfoStyle: {
        marginTop: '9px',
        padding: '9px',
        backgroundColor: '#bc9460',
        margin: '3px',
    },
    paperStyle: {
        marginTop: '9px',
        padding: '9px',
        margin: '3px',
    },
};

class MainLayout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stores: [],
            current_storeid: '',
            user_info: '',
            movements: [],
            all_categories: [],
        };
    }

    componentDidMount() {
        // Get here user information for which loading related information to be rendered into the table
        // const uid = this.props.uid
        const uid = 1;

        // Get stores related to this user
        let all_stores = 'http://127.0.0.1:5000/stores/uid/' + uid;
        let user_info = 'http://127.0.0.1:5000/users/uid/' + uid;

        const request_stores = axios.get(all_stores);
        const request_userinfo = axios.get(user_info);

        axios
            .all([request_stores, request_userinfo])
            .then(
                axios.spread((...responses) => {
                    const response_stores = responses[0];
                    const response_userinfo = responses[1];

                    this.setState({
                        stores: response_stores.data,
                        user_info: response_userinfo.data,
                    });
                }),
            )
            .catch(err => {
                console.log(err);
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

    handleStoreSelect = (storeid) => {
        let categories_url = 'http://127.0.0.1:5000/categories/store/' + storeid;
        let movements_url = 'http://127.0.0.1:5000/movements/store/' + storeid;

        const request_categories = axios.get(categories_url);
        const request_movements = axios.get(movements_url);

        axios
            .all([request_categories, request_movements])
            .then(
                axios.spread((...responses) => {
                    const response_categories = responses[0];
                    const response_movements = responses[1];

                    this.setState({
                        all_categories: response_categories.data,
                        movements: response_movements.data,
                        current_storeid: storeid
                    });
                }),
            )
            .catch(err => {
                console.log(err);
            });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Grid container spacing={0}>
                    <Grid item xs={12} md={2} padding={10}>
                        <Paper elevation={5} className={classes.userInfoStyle}>
                            <InfoPaper stores={this.state.stores} userinfo={this.state.user_info} onStoreSelect={this.handleStoreSelect}/>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={9} padding={10}>
                        <Paper className={classes.paperStyle}>
                            <AddMovementBar sid={this.state.current_storeid} all_categories={this.state.all_categories} onTableAddRequest={this.handleTableAddRequest} />
                        </Paper>
                    </Grid>
                    <Grid container item xs={12} md={12} padding={10}>
                        <Paper className={classes.root} elevation={5} style={{ padding: 10, backgroundColor: '#fafafa' }}>
                            {/*TODO: maybe sid is not useful here */}
                            <MovementsTable sid={this.state.current_storeid} data={this.state.movements} onTableDelete={this.handleTableDelete} onTableEdit={this.handleTableEdit} />
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

const rootElement = document.getElementById('root');
const uid = rootElement.getAttribute('uid');
const StyledMainLayout = withStyles(styles)(MainLayout);
ReactDOM.render(<StyledMainLayout uid={uid} />, rootElement);
