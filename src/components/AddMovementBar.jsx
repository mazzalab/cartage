import React from 'react';

import { Col, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';
import {axioscall_categories_4combo} from "./../axios_manager.jsx";

import '../styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

export default class AddMovementBar extends React.Component {
    barFontSize = 11;
    _isMounted = false;

    state = {
        categories: [<option key={'empty_category'}>{'select'}</option>],
        selected_category: '',
        companies: [<option key={'empty_company'}>{'select'}</option>],
        selected_company: '',
        items_list: [<option key={'empty_item'}>{'select'}</option>],
        selected_code_item: '',
        selected_item: '',
        batches: [<option key={'empty_batch'}>{'select'}</option>],
        selected_batch: '',

        operator: 'Gino Pomicino', // Info to be retrieved from authentication tokens and session data

        quantity: '',
    };

    componentDidMount() {
        this._isMounted = true;

        let items_category = axioscall_categories_4combo();
        if (this._isMounted) {
            this.setState({
                categories: items_category,
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
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
            var today_temp = `${('0' + today.getUTCDate()).slice(-2)}/${('0' + (today.getUTCMonth() + 1)).slice(
                -2,
            )}/${today.getUTCFullYear()}`;
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

            axios
                .post('http://127.0.0.1:5000/add_movement', {
                    code_item,
                    operator,
                    date_movement,
                    batch,
                    quantity,
                })
                .then(response => {
                    const category = {
                        category: this.state.selected_category,
                    };
                    const company = {
                        company: this.state.selected_company,
                    };

                    this.props.onTableAddRequest(
                        response.data['ID'],
                        code_item,
                        operator,
                        date_movement,
                        item,
                        category,
                        batch,
                        company,
                        quantity,
                    );

                    alert('Inserted item with ID: ' + response.data['ID']);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmitNewMovement} method="GET">
                    <Row form>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="category">Category</Label>
                                <Input
                                    type="select"
                                    name="category"
                                    id="category"
                                    value={this.state.selected_category}
                                    onChange={e => {
                                        if (e.target.value === 'select') {
                                            this.setState({
                                                selected_category: '',
                                                selected_company: '',
                                                companies: [<option key={'empty_company'}>{'select'}</option>],
                                                selectedItem: '',
                                                items_list: [<option key={'empty_item'}>{'select'}</option>],
                                                selected_batch: '',
                                                batches: [<option key={'empty_batch'}>{'select'}</option>],
                                                quantity: '',
                                            });
                                        } else {
                                            this.setState({
                                                selected_category: e.target.value,
                                            });

                                            const selectedCat = {
                                                category: e.target.value,
                                            };
                                            axios
                                                .post('http://127.0.0.1:5000/companies_per_category', {
                                                    selectedCat,
                                                })
                                                .then(response => {
                                                    let company_list = response.data['companies'];
                                                    company_list = company_list.map(r => {
                                                        return <option key={r}>{r}</option>;
                                                    });
                                                    company_list.unshift(
                                                        <option key={'empty_item'}>{'select'}</option>,
                                                    );

                                                    this.setState({
                                                        companies: company_list,
                                                    });
                                                })
                                                .catch(err => {
                                                    console.log(err);
                                                });
                                        }
                                    }}
                                    style={{
                                        fontSize: this.barFontSize,
                                    }}
                                >
                                    {this.state.categories}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={2}>
                            <FormGroup>
                                <Label for="company">Company</Label>
                                <Input
                                    type="select"
                                    name="company"
                                    id="company"
                                    value={this.state.selected_company}
                                    style={{
                                        fontSize: this.barFontSize,
                                    }}
                                    onChange={e => {
                                        if (e.target.value === 'select') {
                                            this.setState({
                                                selected_company: '',
                                                selectedItem: '',
                                                items_list: [<option key={'empty_item'}>{'select'}</option>],
                                                selected_batch: '',
                                                batches: [<option key={'empty_batch'}>{'select'}</option>],
                                                quantity: '',
                                            });
                                        } else {
                                            this.setState({
                                                selected_company: e.target.value,
                                            });

                                            const selectedCatCom = {
                                                category: this.state.selected_category,
                                                company: e.target.value,
                                            };
                                            axios
                                                .post('http://127.0.0.1:5000/items_per_category_and_company', {
                                                    selectedCatCom,
                                                })
                                                .then(response => {
                                                    let item_list = response.data['items'];
                                                    item_list = item_list.map(r => {
                                                        return (
                                                            <option code_item={r[0]} value_item={r[1]} key={r[0]}>
                                                                {'(' + r[0] + ') ' + r[1]}
                                                            </option>
                                                        );
                                                    });
                                                    item_list.unshift(
                                                        <option
                                                            code_item={'empty_item'}
                                                            value_item={'empty_item'}
                                                            key={'empty_item'}
                                                        >
                                                            {'select'}
                                                        </option>,
                                                    );

                                                    this.setState({
                                                        items_list: item_list,
                                                    });
                                                })
                                                .catch(err => {
                                                    console.log(err);
                                                });
                                        }
                                    }}
                                    style={{
                                        fontSize: this.barFontSize,
                                    }}
                                >
                                    {this.state.companies}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={3}>
                            <FormGroup>
                                <Label for="item">Item</Label>
                                <Input
                                    type="select"
                                    name="item"
                                    id="item"
                                    onChange={e => {
                                        let selectedIndex = e.target.selectedIndex;
                                        let v_item = e.target[selectedIndex].getAttribute('value_item');
                                        this.setState({
                                            selected_item: v_item,
                                        });

                                        let c_item = e.target[selectedIndex].getAttribute('code_item');
                                        this.setState({
                                            selected_code_item: c_item,
                                        });
                                        const selectedItem = {
                                            code_item: c_item,
                                        };
                                        axios
                                            .post('http://127.0.0.1:5000/batches_per_item', {
                                                selectedItem,
                                            })
                                            .then(response => {
                                                let batch_list = response.data['batches'];
                                                batch_list = batch_list.map(r => {
                                                    return <option key={r}>{r}</option>;
                                                });
                                                batch_list.unshift(<option key={'empty_batch'}>{'select'}</option>);

                                                this.setState({
                                                    batches: batch_list,
                                                });
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            });
                                    }}
                                    style={{
                                        fontSize: this.barFontSize,
                                    }}
                                >
                                    {this.state.items_list}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="batch">Batch</Label>
                                <Input
                                    type="select"
                                    name="batch"
                                    id="batch"
                                    value={this.state.selected_batch}
                                    onChange={e => {
                                        if (e.target.value === 'select') {
                                            this.setState({
                                                selected_batch: '',
                                                quantity: '',
                                            });
                                        } else {
                                            this.setState({
                                                selected_batch: e.target.value,
                                            });
                                        }
                                    }}
                                    style={{
                                        fontSize: this.barFontSize,
                                    }}
                                >
                                    {this.state.batches}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="quantity">Quantities</Label>
                                <Input
                                    type="numeric"
                                    name="quantity"
                                    id="quantity"
                                    placeholder="quantity"
                                    value={this.state.quantity}
                                    onChange={e =>
                                        this.setState({
                                            quantity: e.target.value,
                                        })
                                    }
                                    style={{
                                        fontSize: this.barFontSize,
                                    }}
                                />
                            </FormGroup>
                        </Col>
                        <Col className="bottomCol" md={1}>
                            <Button type="submit" color="primary" className="float-left">
                                Add
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}
