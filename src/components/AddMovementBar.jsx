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
        productid: '',
        operatore: '',
        dataevento: '',
        articolo_list: [<option key={'empty_articolo'}>{'select'}</option>],
        articolo: '',
        categoria: '',
        lotto: '',
        ditta: '',
        quantita: ''
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

        var fempty = this.areEmpty({ 'Product ID': this.state.productid, 'Data evento': this.state.dataevento, 'Lotto': this.state.lotto, 'Quantita': this.state.quantita })
        var fselect = this.areSelect({ 'Operatore': this.state.operatore, 'Articolo': this.state.articolo, 'Categoria': this.state.categoria, 'Ditta': this.state.ditta })

        if (fempty.length !== 0) {
            alert(fempty.toString() + " are missing field(s)");
        } else if (isNaN(this.state.quantita)) {
            alert("The field 'Quantità' is not a number");
        } else if (fselect.length !== 0) {
            alert(fselect.toString() + " must be selected");
        }
        else {
            const productid = {
                productid: this.state.productid
            };
            const operatore = {
                operatore: this.state.operatore
            };
            const dataevento = {
                dataevento: this.state.dataevento
            };
            const articolo = {
                articolo: this.state.articolo
            };
            const categoria = {
                categoria: this.state.categoria
            };
            const lotto = {
                lotto: this.state.lotto
            };
            const ditta = {
                ditta: this.state.ditta
            };
            const quantita = {
                quantita: this.state.quantita
            };

            axios.post("http://127.0.0.1:5000/addMovement", {
                productid,
                operatore,
                dataevento,
                articolo,
                categoria,
                lotto,
                ditta,
                quantita
            }).then(response => {
                //Add a new row in the table by a callback
                this.props.onTableAdd(
                    productid,
                    operatore,
                    dataevento,
                    articolo,
                    categoria,
                    lotto,
                    ditta,
                    quantita);

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
                                <Label for="dataevento">Data evento</Label>
                                <Input
                                    type="date"
                                    name="dataevento"
                                    id="dataevento"
                                    placeholder="Data evento"
                                    value={this.state.dataevento}
                                    onChange={e => this.setState({ dataevento: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="operatore">Operatore</Label>
                                <Input
                                    type="select"
                                    name="operatore"
                                    id="operatore"
                                    placeholder="Operatore"
                                    onChange={e => this.setState({ operatore: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.props.operatori
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="ProductID">Product ID</Label>
                                <Input
                                    type="text"
                                    name="productid"
                                    id="productid"
                                    placeholder="Product ID"
                                    value={this.state.productid}
                                    onChange={e => this.setState({ productid: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="categoria">Categoria</Label>
                                <Input
                                    type="select"
                                    name="categoria"
                                    id="categoria"
                                    onChange={e => {
                                        this.setState({ categoria: e.target.value });

                                        const selectedCat = {
                                            categoria: e.target.value
                                        };
                                        axios.post("http://127.0.0.1:5000/articoliPerCategoria", { selectedCat })
                                            .then(response => {
                                                let articolo_list = response.data.map(r => { return <option key={r.articolo}>{r.articolo}</option> })
                                                articolo_list.unshift(<option key={'empty_articolo'}>{'select'}</option>)

                                                this.setState({ articolo_list: articolo_list });
                                            }).catch(err => {
                                                console.log(err);
                                            });
                                    }}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.props.categorie
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={3}>
                            <FormGroup>
                                <Label for="articolo">Articolo</Label>
                                <Input
                                    type="select"
                                    name="articolo"
                                    id="articolo"
                                    onChange={e => this.setState({ articolo: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.state.articolo_list
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="lotto">Lotto</Label>
                                <Input
                                    type="text"
                                    name="lotto"
                                    id="lotto"
                                    placeholder="Lotto"
                                    value={this.state.lotto}
                                    onChange={e => this.setState({ lotto: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="ditta">Ditta</Label>
                                <Input
                                    type="select"
                                    name="ditta"
                                    id="ditta"
                                    onChange={e => this.setState({ ditta: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.props.ditte
                                    }
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="quantita">Quantità</Label>
                                <Input
                                    type="numeric"
                                    name="quantita"
                                    id="quantita"
                                    placeholder="Quantità"
                                    value={this.state.quantita}
                                    onChange={e => this.setState({ quantita: e.target.value })}
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