import React from 'react';
import axios from 'axios';
import { axioscall_categories_4combo, axioscall_addMovement } from './../axios_manager.jsx';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';

const styles = {
    menuitem: {
        fontSize: 12,
    },
    userInfo: {
        fontWeight: 'bold',
    },
    formControl: {
        minWidth: 140,
        paddingRight: '5px',
    },
    selectEmpty: {
        fontSize: 11,
    },
    quantityEmpty: {
        fontSize: 11,
        minWidth: 10,
        maxWidth: 50,
        paddingRight: '5px',
    },
    buttonStyle: {
        marginLeft: '10px'
    }
};

class AddMovementBar extends React.Component {
    _isMounted = false;

    state = {
        current_selection: {
            category: 'select',
            company: 'select',
            item: 'select',
            batch: 'select',
            quantity: 1,
        },

        categories: [],
        companies: [],
        disabled_company: true,
        items: [],
        disabled_item: true,
        batches: [],
        disabled_batch: true,
        disabled_quantity: true,
        error_quantity: false,
        disabled_button: true
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.all_categories.length > 0) {
            const { classes } = nextProps;
            const cat_list = nextProps.all_categories.map(cat => {
                return (
                    <MenuItem className={classes.menuitem} value={cat.id} key={cat.id}>
                        {cat.name}
                    </MenuItem>
                );
            });

            // Update state only if props changed
            if (cat_list.join('') !== prevState.categories.join('')) {
                return {
                    categories: cat_list,
                };
            } else return null;
        } else {
            return null;
        }
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

    handleCategoryChange = event => {
        let newValue = event.target.value;

        if (newValue === 'select') {
            let new_current_selection = this.state.current_selection;
            new_current_selection.company = 'select';
            new_current_selection.item = 'select';
            // new_current_selection.item_code = null;
            new_current_selection.batch = 'select';
            new_current_selection.quantity = null;

            this.setState({
                disabled_company: true,
                current_selection: new_current_selection,
            });
        } else {
            axios
                .get('http://127.0.0.1:5000/companies/' + newValue + '/' + this.props.sid)
                .then(response => {
                    let company_list = response.data;
                    const { classes } = this.props;
                    company_list = company_list.map(r => {
                        return (
                            <MenuItem className={classes.menuitem} value={r.id} key={r.id}>
                                {r.name}
                            </MenuItem>
                        );
                    });

                    // Update current_selection with the selected Category
                    let new_current_selection = this.state.current_selection;
                    new_current_selection.category = newValue;

                    this.setState(
                        {
                            current_selection: new_current_selection,
                            companies: company_list,
                        },
                        () => {
                            if (company_list.length == 0) {
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
    };

    handleCompanyChange = event => {
        let newValue = event.target.value;

        if (newValue === 'select') {
            let new_current_selection = this.state.current_selection;
            new_current_selection.item = 'select';
            // new_current_selection.item_code = null;
            new_current_selection.batch = 'select';
            new_current_selection.quantity = null;

            this.setState({
                disabled_item: true,
                current_selection: new_current_selection,
            });
        } else {
            axios
                .post('http://127.0.0.1:5000/items/category/' + this.state.current_selection.category + '/company/' + newValue + '/store/' + this.props.sid)
                .then(response => {
                    let item_list = response.data;
                    const { classes } = this.props;
                    item_list = item_list.map(r => {
                        return (
                            <MenuItem className={classes.menuitem} value={r.id} key={r.id}>
                                {r.name}
                            </MenuItem>
                        );
                    });

                    // Update current_selection with the selected Category
                    let new_current_selection = this.state.current_selection;
                    new_current_selection.company = newValue;

                    // Update the state
                    this.setState(
                        {
                            current_selection: new_current_selection,
                            items: item_list,
                        },
                        () => {
                            if (item_list.length == 0) {
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
    };

    handleItemChange = event => {
        let newValue = event.target.value;

        if (newValue === 'select') {
            let new_current_selection = this.state.current_selection;
            new_current_selection.batch = 'select';
            new_current_selection.quantity = null;

            this.setState({
                disabled_batch: true,
                current_selection: new_current_selection,
            });
        } else {
            axios
                .post('http://127.0.0.1:5000/batches/item/' + newValue + '/store/' + this.props.sid)
                .then(response => {
                    let batch_list = response.data;
                    const { classes } = this.props;
                    batch_list = batch_list.map(r => {
                        return (
                            <MenuItem className={classes.menuitem} value={r.id} key={r.id}>
                                {r.code}
                            </MenuItem>
                        );
                    });

                    // Update current_selection with the selected Item
                    let new_current_selection = this.state.current_selection;
                    new_current_selection.item = newValue;

                    // Update the state
                    this.setState(
                        {
                            current_selection: new_current_selection,
                            batches: batch_list,
                        },
                        () => {
                            if (batch_list.length == 0) {
                                this.setState({
                                    disabled_batch: true,
                                });
                            } else {
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
    };

    handleBatchChange = event => {
        let newValue = event.target.value;

        if (newValue === 'select') {
            let new_current_selection = this.state.current_selection;
            new_current_selection.quantity = 0;

            this.setState({
                disabled_quantity: true,
                current_selection: new_current_selection,
            });
        } else {
            let new_current_selection = this.state.current_selection;
            new_current_selection.batch = newValue;

            this.setState({
                current_selection: new_current_selection,
                disabled_quantity: false
            });
        }
    };

    handleQuantityChange = event => {
        let newValue = event.target.value;
        
        if(isNaN(newValue) || newValue == 0){
            this.setState({
                error_quantity: true,
                disabled_button: true
            })
            alert("Quantity must be a non zero number")
        } else{
            let new_current_selection = this.state.current_selection;
            new_current_selection.quantity = newValue;

            this.setState({
                error_quantity: false,
                disabled_button: false,
                current_selection: new_current_selection
            })
        }
    };

    render() {
        if (!this.props.all_categories) {
            return null;
        }

        const { classes } = this.props;
        return (
            <div>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Category</InputLabel>
                    <Select value={this.state.current_selection.category} className={classes.selectEmpty} onChange={this.handleCategoryChange}>
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.categories}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Company</InputLabel>
                    <Select value={this.state.current_selection.company} className={classes.selectEmpty} onChange={this.handleCompanyChange} disabled={this.state.disabled_company}>
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.companies}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Item</InputLabel>
                    <Select value={this.state.current_selection.item} className={classes.selectEmpty} onChange={this.handleItemChange} disabled={this.state.disabled_item}>
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.items}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Batch</InputLabel>
                    <Select value={this.state.current_selection.batch} className={classes.selectEmpty} disabled={this.state.disabled_batch} onChange={this.handleBatchChange}>
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.batches}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel className={classes.userInfo} htmlFor="standard-error">
                        Quantity
                    </InputLabel>
                    <Input
                        error={this.state.error_quantity}
                        id="standard-error"
                        className={classes.quantityEmpty}
                        defaultValue={0}
                        disabled={this.state.disabled_quantity}
                        onBlur={this.handleQuantityChange}
                    />
                </FormControl>
                <Button variant="contained" color="primary" disabled={this.state.disabled_button} className={classes.buttonStyle} onSubmit={this.handleSubmitNewMovement}>
                     Add
                 </Button>
            </div>
        );
    }
}

const StyledAddMovementBar = withStyles(styles)(AddMovementBar);
export default StyledAddMovementBar;
