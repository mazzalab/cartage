import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import InfoPaper from './components/InfoPaper';
import AddMovementBar from './components/AddMovementBar';
import MovementsTable from './components/MovementsTable';

import { withStyles } from '@material-ui/core/styles';
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
        //TODO: Get here user information for which loading related information to be rendered into the table
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

    handleTableAddRequest = (current_selection) => {
        //TODO: Get here user information for which loading related information to be rendered into the table
        // const uid = this.props.uid
        const uid = 1;
        
        var today = new Date();
        var today_temp = `${('0' + today.getUTCDate()).slice(-2)}/${('0' + (today.getUTCMonth() + 1)).slice(-2)}/${today.getUTCFullYear()}`;
        const date_movement = {
            date_movement: today_temp,
        };
        const quantity = {
            quantity: current_selection.quantity,
        };

        const item = {
            item: current_selection.itemId
        };
        const batch = {
            batch: current_selection.batchId,
        };
        const operator = {
            operator: uid,
        };

        
        axios.post('http://127.0.0.1:5000/add_movement', {
            date_movement,
            quantity,
            item,
            batch,
            operator
        })
        .then(response => {
            // TODO: check if response is OK
            let res = response.data;
            var newMovements = this.state.movements;
            newMovements.unshift({
                id: res['movement_id'],
                code_item: res['item_code'],
                operator: res['operator_name'] + " " + res['operator_surname'],
                date_movement: today_temp,
                item: res['item_name'],
                category: current_selection.categoryName,
                batches: res['batch_code'],
                company: current_selection.companyName,
                quantity: current_selection.quantity,
            });
            
            this.setState({ movements: newMovements }, ()=>{
                alert('Inserted item');
                // return 'Inserted item with ID: ' + res['ID'];
            });
        })
        .catch(err => {
            alert('Insert error.\nMessage: ' + err);
        });       
    };

    handleTableDelete = movement_id => {
        var filteredData = this.state.movements.filter(el => el.id !== movement_id);
        this.setState({ movements: filteredData });
    };

    handleTableEdit = movement_info => {
        let new_mov_table = JSON.parse(JSON.stringify(this.state.movements));
        for (let mov in new_mov_table){
            if(mov.id === movement_info.id){
                new_mov_table.date_movement = movement_info.date_movement;
                new_mov_table.batches = movement_info.batch;
                new_mov_table.quantity = movement_info.quantity;
                break;
            }
        }

        this.setState({
            movements: new_mov_table
        })
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
                            <MovementsTable data={this.state.movements} onTableDelete={this.handleTableDelete} onTableEdit={this.handleTableEdit} /> {/* sid={this.state.current_storeid} */}
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
