import React from 'react';
import axios from 'axios';

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
        marginLeft: '15px',
        marginTop: '10px',
        fontSize: 12,
    },
};

class AddMovementBar extends React.Component {
    _isMounted = false;

    state = {
        current_selection: {
            categoryId: 'select',
            categoryName: 'select',
            companyId: 'select',
            companyName: 'select',
            itemId: 'select',
            batchId: 'select',
            quantity: 0,
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
        disabled_button: true,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.all_categories.length > 0) {
            const { classes } = nextProps;
            const cat_list = nextProps.all_categories.map((cat) => {
                return (
                    <MenuItem className={classes.menuitem} value={cat.id} data-category-name={cat.name} key={cat.id}>
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
            // If all_categories is empty or null, then 'select' was chosen in the lab selection combobox
            let newState = prevState;
            newState.categories = [];
            newState.current_selection.categoryId = 'select';
            newState.current_selection.categoryName = 'select';
            newState.companies = [];
            newState.current_selection.companyId = 'select';
            newState.current_selection.companyName = 'select';
            newState.items = [];
            newState.current_selection.itemId = 'select';
            newState.batches = [];
            newState.current_selection.batchId = 'select';

            newState.disabled_company = true;
            newState.disabled_item = true;
            newState.disabled_batch = true;
            newState.disabled_quantity = true;
            newState.disabled_button = true;

            // TODO: Reset the quantity field to zero

            return newState;
        }
    }

    handleSubmitNewMovement = (e) => {
        e.preventDefault();
        this.props.onTableAddRequest(this.state.current_selection);
    };

    handleCategoryChange = (event) => {
        let categoryId = event.target.value;
        let { categoryName } = event.currentTarget.dataset;

        if (categoryId === this.state.current_selection.itemId) {
            return;
        } else {
            let new_current_selection = Object.assign({}, this.state.current_selection);
            new_current_selection.categoryId = categoryId;
            new_current_selection.categoryName = categoryName;

            new_current_selection.companyId = 'select';
            new_current_selection.companyName = 'select'
            new_current_selection.itemId = 'select';
            new_current_selection.batchId = 'select';
            new_current_selection.quantity = 0;
            this.input_name.value = 0;

            if (categoryId === 'select') {
                this.setState({
                    disabled_company: true,
                    disabled_item: true,
                    disabled_batch: true,
                    disabled_quantity: true,
                    disabled_button: true,
                    current_selection: new_current_selection,
                    items: [],
                    batches: [],
                    companies: []
                });
            } else {
                axios
                    .get('http://127.0.0.1:5000/companies/' + categoryId + '/' + this.props.sid)
                    .then((response) => {
                        let company_list = response.data;
                        const { classes } = this.props;
                        company_list = company_list.map((r) => {
                            return (
                                <MenuItem className={classes.menuitem} value={r.id} data-company-name={r.name} key={r.id}>
                                    {r.name}
                                </MenuItem>
                            );
                        });

                        this.setState(
                            {
                                current_selection: new_current_selection,
                                companies: company_list,
                            },
                            () => {
                                if (company_list.length == 0) {
                                    this.setState({
                                        disabled_company: true,
                                    });
                                } else {
                                    this.setState({
                                        disabled_company: false,
                                    });
                                }
                            },
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    };

    handleCompanyChange = (event) => {
        let companyId = event.target.value;
        let { companyName } = event.currentTarget.dataset;
        if (companyId === this.state.current_selection.itemId) {
            return;
        } else {
            let new_current_selection = Object.assign({}, this.state.current_selection);
            new_current_selection.companyId = companyId;
            new_current_selection.companyName = companyName;

            new_current_selection.itemId = 'select';
            new_current_selection.batchId = 'select';
            new_current_selection.quantity = 0;
            this.input_name.value = 0;

            if (companyId === 'select') {
                this.setState({
                    disabled_item: true,
                    disabled_batch: true,
                    disabled_quantity: true,
                    disabled_button: true,
                    current_selection: new_current_selection,
                    items: [],
                    batches: [],
                });
            } else {
                axios
                    .post('http://127.0.0.1:5000/items/category/' + this.state.current_selection.categoryId + '/company/' + companyId + '/store/' + this.props.sid)
                    .then((response) => {
                        let item_list = response.data;
                        const { classes } = this.props;
                        item_list = item_list.map((r) => {
                            return (
                                <MenuItem className={classes.menuitem} value={r.id} key={r.id}>
                                    {r.name}
                                </MenuItem>
                            );
                        });

                        this.setState(
                            {
                                current_selection: new_current_selection,
                                items: item_list,
                            },
                            () => {
                                if (item_list.length == 0) {
                                    this.setState({
                                        disabled_item: true,
                                    });
                                } else {
                                    this.setState({
                                        disabled_item: false,
                                    });
                                }
                            },
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    };

    handleItemChange = (event) => {
        let itemId = event.target.value;
        if (itemId === this.state.current_selection.itemId) {
            return;
        } else {
            let new_current_selection = Object.assign({}, this.state.current_selection);
            new_current_selection.itemId = itemId;
            new_current_selection.batchId = 'select';
            new_current_selection.quantity = 0;
            this.input_name.value = 0;

            if (itemId === 'select') {
                this.setState({
                    disabled_batch: true,
                    disabled_quantity: true,
                    disabled_button: true,
                    current_selection: new_current_selection,
                    batches: [],
                });
            } else {
                axios
                    .post('http://127.0.0.1:5000/batches/item/' + itemId + '/store/' + this.props.sid)
                    .then((response) => {
                        let batch_list = response.data;
                        const { classes } = this.props;
                        batch_list = batch_list.map((r) => {
                            return (
                                <MenuItem className={classes.menuitem} value={r.id} key={r.id}>
                                    {r.code}
                                </MenuItem>
                            );
                        });

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
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    };

    handleBatchChange = (event) => {
        let batchId = event.target.value;
        if (batchId === this.state.current_selection.itemId) {
            return;
        } else {
            let new_current_selection = Object.assign({}, this.state.current_selection);
            new_current_selection.batchId = batchId;
            new_current_selection.quantity = 0;
            this.input_name.value = 0;

            if (batchId === 'select') {
                this.setState({
                    disabled_quantity: true,
                    disabled_button: true,
                    current_selection: new_current_selection,
                });
            } else {
                this.setState({
                    current_selection: new_current_selection,
                    disabled_quantity: false,
                    disabled_button: false,
                });
            }
        }
    };

    handleQuantityChange = (event) => {
        let quantityValue = event.target.value;
        let new_current_selection = Object.assign({}, this.state.current_selection);
        new_current_selection.quantity = quantityValue;

        if (isNaN(quantityValue) || quantityValue == 0) {
            this.setState({
                error_quantity: true,
                disabled_button: true,
                current_selection: new_current_selection,
            });
            alert('Quantity must be a non zero number');
        } else {
            this.setState({
                error_quantity: false,
                disabled_button: false,
                current_selection: new_current_selection,
            });
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
                    <Select value={this.state.current_selection.categoryId} className={classes.selectEmpty} onChange={this.handleCategoryChange}>
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.categories}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Company</InputLabel>
                    <Select
                        value={this.state.current_selection.companyId}
                        className={classes.selectEmpty}
                        onChange={this.handleCompanyChange}
                        disabled={this.state.disabled_company}
                    >
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.companies}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Item</InputLabel>
                    <Select value={this.state.current_selection.itemId} className={classes.selectEmpty} onChange={this.handleItemChange} disabled={this.state.disabled_item}>
                        <MenuItem className={classes.menuitem} value="select">
                            <em>select</em>
                        </MenuItem>
                        {this.state.items}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel className={classes.userInfo}>Batch</InputLabel>
                    <Select value={this.state.current_selection.batchId} className={classes.selectEmpty} disabled={this.state.disabled_batch} onChange={this.handleBatchChange}>
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
                        inputRef={(el) => (this.input_name = el)}
                    />
                </FormControl>
                <Button variant="contained" color="primary" disabled={this.state.disabled_button} className={classes.buttonStyle} onClick={this.handleSubmitNewMovement}>
                    Add
                </Button>
            </div>
        );
    }
}

const StyledAddMovementBar = withStyles(styles)(AddMovementBar);
export default StyledAddMovementBar;
