import React from 'react';
import { Col, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';


export default class AddMovementBar extends React.Component {
    // constructor(props) {
    //     super(props)
    // }
    barFontSize = 11;

    state = {
        productid: '',
        operatore: '',
        dataevento: '',
        categoria: '',
        lotto: '',
        ditta: '',
        quantita: ''
    }

    areEmpty = (fields) => {
        var fempty = Object.keys(fields).map(function(key) {
            if (fields[key].trim() == '') return key;
        });

        return fempty;
    }

    handleSubmitNewMovement = e => {
        e.preventDefault();

        var fempty = this.areEmpty({'Product ID': this.state.productid, 'Data evento': this.state.dataevento, 'Lotto': this.state.lotto, 'State': this.state.quantita})
        if (fempty.length != 0) {
            alert(fempty.toString() + "fields are missing");
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
            const categoria = {
                categoria: this.state.categorie
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

            const form = axios.get("/api/form", {
                productid,
                operatore,
                dataevento,
                categoria,
                lotto,
                ditta,
                quantita
            });
        }
    }

    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmitNewMovement} method="GET">
                    <Row form>
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
                                <Label for="categoria">Categoria</Label>
                                <Input
                                    type="select"
                                    name="categoria"
                                    id="categoria"
                                    onChange={e => this.setState({ categoria: e.target.value })}
                                    style={{ fontSize: this.barFontSize }}
                                >
                                    {
                                        this.props.categorie
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
                    </Row>
                    <Button type="submit">Add</Button>
                </Form>
            </div>
        )
    }
}