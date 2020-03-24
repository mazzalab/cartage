import React from 'react';
import axios from 'axios';
import { axioscall_categories_4combo, axioscall_addMovement } from './../axios_manager.jsx';

import Button from '@material-ui/core/Button';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import '../../static/css/bootstrap_4_3_1.min.css';

const styles = {
    divStyle: {
        display: 'flex',
        alignItems: 'center'
    },
    buttonStyle: {
        margin : '10px',
    }
};

class AddMovementBar extends React.Component {
    _isMounted = false;

    state = {
        current_selection: [
            {
                id: 1,
                category: 'select',
                company: 'select',
                item: 'select',
                item_code: null,
                batch: 'select',
                quantity: null,
            },
        ],
        categories: [
            {
                value: 'select',
                label: 'select',
            },
        ],
        companies: [
            {
                value: 'select',
                label: 'select',
            },
        ],
        disabled_company: true,
        items: [
            {
                value: 'select',
                label: 'select',
            },
        ],
        disabled_item: true,
        batches: [
            {
                value: 'select',
                label: 'select',
            },
        ],
        disabled_batch: true,
        disabled_quantity: true,

        operator: 'Gino Pomicino', // Info to be retrieved from authentication tokens and session data
    };

    // componentDidMount() {
    //     this._isMounted = true;

    //     axioscall_categories_4combo().then(items_category => {
    //         if (this._isMounted) {
    //             this.setState({
    //                 categories: items_category,
    //             });
    //         }
    //     });
    // }

    // componentWillUnmount() {
    //     this._isMounted = false;
    // }

    // componentDidUpdate(nextProps) {
    //     if (this.state.companies.length > 1) {
    //         if (this.state.disabled_company) {
    //             this.setState({
    //                 disabled_company: false,
    //             });
    //             console.log('HERE');
    //         }
    //     }
    // }

    componentWillReceiveProps(nextProps) {
        // Get a unique list of categories
        let categs = nextProps.all_categories.map(value => value.name);
        // Format this list as an array of label-value
        let cat_list = categs.map(function(cat) {
            return {
                value: cat,
                label: cat,
                key: cat,
            };
        });
        cat_list.unshift({ value: 'select', label: 'select', key: 'empty_category' });

        this.setState({
            categories: cat_list,
        });
    }

    areEmpty = fields => {
        let fempty = Object.keys(fields).filter(function(key) {
            return fields[key].trim() === '';
        });

        return fempty;
    };

    areSelect = fields => {
        let fselect = Object.keys(fields).filter(function(key) {
            return fields[key] === 'select';
        });

        return fselect;
    };

    handleSubmitNewMovement = e => {
        e.preventDefault();

        var fempty = this.areEmpty({ Quantity: this.state.quantity });
        var fselect = this.areSelect({
            Operator: this.state.operator,
            'Item code': this.state.selected_code_item,
            Batch: this.state.selected_batch,
            Category: this.state.selected_category,
            Company: this.state.selected_company,
        });

        if (fempty.length !== 0) {
            alert(fempty.toString() + ' is empty');
        } else if (isNaN(this.state.quantity)) {
            alert("The field 'Quantity' is not a number");
        } else if (fselect.length !== 0) {
            alert(fselect.toString() + ' must be selected');
        } else {
            const operator = {
                operator: this.state.operator,
            };

            var today = new Date();
            var today_temp = `${('0' + today.getUTCDate()).slice(-2)}/${('0' + (today.getUTCMonth() + 1)).slice(-2)}/${today.getUTCFullYear()}`;
            const date_movement = {
                date_movement: today_temp,
            };
            const code_item = {
                code_item: this.state.selected_code_item,
            };
            const item = {
                item: this.state.selected_item,
            };
            const batch = {
                batch: this.state.selected_batch,
            };
            const quantity = {
                quantity: this.state.quantity,
            };
            const category = {
                category: this.state.selected_category,
            };
            const company = {
                company: this.state.selected_company,
            };

            axioscall_addMovement(code_item, operator, date_movement, batch, quantity, item, category, company, this.props.onTableAddRequest).then(insert_msg => {
                alert(insert_msg);
            });
        }
    };

    setSelectEvents = (oldValue, newValue, row, column) => {
        if (column.dataField == 'category') {
            if (newValue === 'select') {
                let new_current_selection = this.state.current_selection[0];
                new_current_selection.category = 'select';
                new_current_selection.company = 'select';
                new_current_selection.item = 'select';
                new_current_selection.item_code = null;
                new_current_selection.batch = 'select';
                new_current_selection.quantity = null;

                this.setState({
                    disabled_company: true,
                    current_selection: [new_current_selection],
                });
            } else {
                const selectedCat = {
                    category: newValue,
                };
                axios
                    .post('http://127.0.0.1:5000/companies_per_category', { selectedCat })
                    .then(response => {
                        // Fill the company_list with all resulting companies
                        let company_list = response.data['companies'];
                        company_list = company_list.map(r => {
                            return {
                                value: r,
                                label: r,
                                key: r,
                            };
                        });
                        company_list.unshift({ value: 'select', label: 'select', key: 'empty_company' });

                        // Update current_selection with the selected Category
                        let new_current_selection = this.state.current_selection[0];
                        new_current_selection.category = newValue;

                        // Update the state
                        this.setState(
                            {
                                current_selection: [new_current_selection],
                                companies: company_list,
                            },
                            () => {
                                if (company_list.length == 1) {
                                    // If the query did not get any result -> disable company
                                    this.setState({
                                        disabled_company: true,
                                    });
                                } else {
                                    // Enable company combobox only after having filled the company list and updated the UI
                                    this.setState({
                                        disabled_company: false,
                                    });
                                }
                            },
                        );
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        } else if (column.dataField == 'company') {
            if (newValue === 'select') {
                let new_current_selection = this.state.current_selection[0];
                new_current_selection.company = 'select';
                new_current_selection.item = 'select';
                new_current_selection.item_code = null;
                new_current_selection.batch = 'select';
                new_current_selection.quantity = null;

                this.setState({
                    disabled_item: true,
                    current_selection: [new_current_selection],
                });
            } else {
                const selectedCatCom = {
                    category: this.state.current_selection[0].category,
                    company: newValue,
                };
                axios
                    .post('http://127.0.0.1:5000/items_per_category_and_company', { selectedCatCom })
                    .then(response => {
                        // Fill the item_list with all resulting companies
                        let item_list = response.data['items'];

                        item_list = item_list.map(r => {
                            return {
                                value: '(' + r[0] + ') ' + r[1],
                                label: '(' + r[0] + ') ' + r[1],
                                key: r[0],
                            };
                        });
                        item_list.unshift({ value: 'select', label: 'select', key: 'empty_item' });

                        // Update current_selection with the selected Category
                        let new_current_selection = this.state.current_selection[0];
                        new_current_selection.company = newValue;

                        this.setState(
                            {
                                current_selection: [new_current_selection],
                                items: item_list,
                            },
                            () => {
                                if (item_list.length == 1) {
                                    // If the query did not get any result -> disable company
                                    this.setState({
                                        disabled_item: true,
                                    });
                                } else {
                                    // Enable company combobox only after having filled the company list and updated the UI
                                    this.setState({
                                        disabled_item: false,
                                    });
                                }
                            },
                        );
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        } else if (column.dataField == 'item') {
            if (newValue === 'select') {
                let new_current_selection = this.state.current_selection[0];
                new_current_selection.item_code = null;
                new_current_selection.item = 'select';
                new_current_selection.batch = 'select';
                new_current_selection.quantity = null;

                this.setState({
                    disabled_batch: true,
                    current_selection: [new_current_selection],
                });
            } else {
                const selectedItem = {
                    // Get the element into parenthesis, i.e., the item code
                    code_item: newValue.match(/\(([^)]+)\)/)[1],
                };
                axios
                    .post('http://127.0.0.1:5000/batches_per_item', { selectedItem })
                    .then(response => {
                        // Fill the batch with all resulting batches
                        let batch_list = response.data['batches'];
                        batch_list = batch_list.map(r => {
                            return {
                                value: r,
                                label: r,
                                key: r,
                            };
                        });
                        batch_list.unshift({ value: 'select', label: 'select', key: 'empty_batch' });

                        // Update current_selection with the selected Category
                        let new_current_selection = this.state.current_selection[0];
                        new_current_selection.item_code = selectedItem.code_item;
                        new_current_selection.item = newValue;

                        // Update the state
                        this.setState(
                            {
                                current_selection: [new_current_selection],
                                batches: batch_list,
                            },
                            () => {
                                if (batch_list.length == 1) {
                                    // If the query did not get any result -> disable company
                                    this.setState({
                                        disabled_batch: true,
                                    });
                                } else {
                                    // Enable company combobox only after having filled the company list and updated the UI
                                    this.setState({
                                        disabled_batch: false,
                                    });
                                }
                            },
                        );
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        } else if (column.dataField == 'batch') {
            if (newValue === 'select') {
                let new_current_selection = this.state.current_selection[0];
                new_current_selection.batch = 'select';
                new_current_selection.quantity = null;

                this.setState({
                    disabled_quantity: true,
                    current_selection: [new_current_selection],
                });
            } else {
                let new_current_selection = this.state.current_selection[0];
                new_current_selection.batch = newValue;

                this.setState({
                    current_selection: [new_current_selection],
                    disabled_quantity: false,
                });
            }
        } else {
            let new_current_selection = this.state.current_selection[0];
            new_current_selection.quantity = newValue;
        }
    };

    formatHeader = () => {
        const header_string = [
            {
                dataField: 'id',
                text: 'ID',
                hidden: true,
            },
            {
                dataField: 'category',
                text: 'Category',
                editor: {
                    type: Type.SELECT,
                    options: this.state.categories,
                    style: { fontSize: 13 },
                },
                headerStyle: (column, colIndex) => {
                    return { width: '100px', fontSize: 13 };
                },
                style: () => {
                    return { fontSize: 13, background: 'rgb(230, 230, 255)' };
                },
            },
            {
                dataField: 'company',
                text: 'Company',
                editor: {
                    type: Type.SELECT,
                    options: this.state.companies,
                    disabled: this.state.disabled_company,
                    style: { fontSize: 13 },
                },
                headerStyle: (column, colIndex) => {
                    return { width: '100px', height: '0px', fontSize: 13 };
                },
                style: () => {
                    return { fontSize: 13, background: 'rgb(230, 230, 255)' };
                },
            },
            {
                dataField: 'item',
                text: 'Item',
                editor: {
                    type: Type.SELECT,
                    options: this.state.items,
                    disabled: this.state.disabled_item,
                    style: { fontSize: 13 },
                },
                headerStyle: (column, colIndex) => {
                    return { fontSize: 13 };
                },
                style: () => {
                    return { fontSize: 13, background: 'rgb(230, 230, 255)' };
                },
            },
            {
                dataField: 'batch',
                text: 'Batch',
                editor: {
                    type: Type.SELECT,
                    options: this.state.batches,
                    disabled: this.state.disabled_batch,
                    style: { fontSize: 13 },
                },
                headerStyle: (column, colIndex) => {
                    return { width: '100px', height: '0px', fontSize: 13 };
                },
                style: () => {
                    return { fontSize: 13, background: 'rgb(230, 230, 255)' };
                },
            },
            {
                dataField: 'quantity',
                text: 'Quantity',
                editor: {
                    type: Type.TEXT,
                    disabled: this.state.disabled_quantity,
                    style: { fontSize: 13 },
                },
                validator: (newValue, row, column) => {
                    if (isNaN(newValue)) {
                        return {
                            valid: false,
                            message: 'Quantity must be numeric',
                        };
                    }
                    if (newValue < 1) {
                        return {
                            valid: false,
                            message: 'Quantity must be positive',
                        };
                    }
                    return true;
                },
                headerStyle: (column, colIndex) => {
                    return { width: '100px', height: '0px', fontSize: 13 };
                },
                style: () => {
                    return { fontSize: 13, background: 'rgb(230, 230, 255)' };
                },
            },
        ];

        return header_string;
    };

    render() {
        if (!this.props.all_categories) return null;

        const { classes } = this.props;
        return (
            <div className={classes.divStyle}>
                <BootstrapTable
                    keyField="id"
                    data={this.state.current_selection}
                    columns={this.formatHeader()}
                    cellEdit={cellEditFactory({
                        mode: 'click',
                        blurToSave: true,
                        beforeSaveCell: (oldValue, newValue, row, column) => {
                            this.setSelectEvents(oldValue, newValue, row, column);
                        },
                    })}
                    bordered={false}
                    // striped
                    condensed
                    bootstrap4
                />
                <Button variant="contained" color="primary" className={classes.buttonStyle}>
                    Add
                </Button>
            </div>
        );
    }
}

const StyledAddMovementBar = withStyles(styles)(AddMovementBar);
export default StyledAddMovementBar;
