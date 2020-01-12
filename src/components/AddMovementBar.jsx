import React from 'react';

import { Col, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';

import '../styles.css';


export default class AddMovementBar extends React.Component {
    // constructor(props) {
    //     super(props)

    //     console.log('AA:  ' + this.props.articolo);
    // }
    barFontSize = 11;

    state = {
        code_item: '',
        operator: '',
        date_movement: '',
        items_list: [<option key={'empty_item'}>{'select'}</option>],
        item: '',
        category: '',
        batch: '',
        company: '',
        quantity: ''
    }

    areEmpty = (fields) => {
        let fempty = Object.keys(fields).filter(function (key) {
            return fields[key].trim() === "";
        });

        return fempty;
    }

    areSelect = (fields) => {
        let fselect = Object.keys(fields).filter(function (key) {
            return fields[key] === "select";
        });

        return fselect;
    }

    handleSubmitNewMovement = e => {
        e.preventDefault();

        var fempty = this.areEmpty({ 'Item code': this.state.code_item, 'Movement date': this.state.date_movement, 'Batch': this.state.batch, 'Quantity': this.state.quantity })
        var fselect = this.areSelect({ 'Operator': this.state.operator, 'Item': this.state.item, 'Category': this.state.category, 'Company': this.state.company })

        if (fempty.length !== 0) {
            alert(fempty.toString() + " are missing field(s)");
        } else if (isNaN(this.state.quantity)) {
            alert("The field 'Quantity' is not a number");
        } else if (fselect.length !== 0) {
            alert(fselect.toString() + " must be selected");
        }
        else {
            const code_item = {
                code_item: this.state.code_item
            };
            const operator = {
                operator: this.state.operator
            };
            const date_movement = {
                date_movement: this.state.date_movement
            };
            const item = {
                item: this.state.item
            };
            const category = {
                category: this.state.category
            };
            const batch = {
                batch: this.state.batch
            };
            const company = {
                company: this.state.company
            };
            const quantity = {
                quantity: this.state.quantity
            };

            axios.post("http://127.0.0.1:5000/add_movement", {
                code_item,
                operator,
                date_movement,
                item,
                category,
                batch,
                company,
                quantity
            }).then(response => {
                //Add a new row in the table by a callback
                this.props.onTableAdd(
                    code_item,
                    operator,
                    date_movement,
                    item,
                    category,
                    batch,
                    company,
                    quantity);

                alert('Inserted item with ID: ' + response.data['ID']);
            }).catch(err => {
                console.log(err);
            });
        }
    }

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
                                    onChange={e => {
                                        this.setState({ category: e.target.value });

                                        const selectedCat = {
                                            category: e.target.value
                                        };
                                        axios.post("http://127.0.0.1:5000/items_per_category", { selectedCat })
                                            .then(response => {
                                                let items_list = response.data.map(r => { return <option key={r.item}>{r.item}</option> })
                                                items_list.unshift(<option key={'empty_item'}>{'select'}</option>)

                                                this.setState({ items_list: items_list });
                                            }).catch(err => {
                                                console.log(err);
                                            });
                                    }}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.props.categories
                                    }
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
                                    onChange={e => this.setState({ company: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.props.companies
                                    }
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
                                    onChange={e => this.setState({ item: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.state.items_list
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="batch">Batch</Label>
                                <Input
                                    type="text"
                                    name="batch"
                                    id="batch"
                                    placeholder="batch"
                                    value={this.state.batch}
                                    onChange={e => this.setState({ batch: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                />
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
                                    onChange={e => this.setState({ quantity: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                />
                            </FormGroup>
                        </Col>
                        <Col className="bottomCol" md={1}>
                            <Button type="submit" color="primary" className="float-left">Add</Button>
                        </Col>
                    </Row>

                </Form>
            </div>
        )
    }
}