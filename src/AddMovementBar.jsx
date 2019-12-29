import React from 'react';
import { Col, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';


export default class AddMovementBar extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        productid: '',
        operatore: '',
        dataevento: '',
        categoria: '',
        lotto: '',
        ditta: '',
        quantita: ''
    }

    componentDidMount () {
        this.setState({ categoria: this.props.categorie})
        this.setState({ ditta: this.props.ditte})
    }

    onMovementAdd = (e) => {
        e.preventDefault()
        alert(this.state.productid + ' ' + this.state.categoria + ' - ' + this.state.dataevento);
    }

    render() {
        return (
            <div>
                <Form onSubmit={this.onMovementAdd}>
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
                                />
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="operatore">Operatore</Label>
                                <Input
                                    type="text"
                                    name="operatore"
                                    id="operatore"
                                    placeholder="Operatore"
                                    value={this.state.operatore}
                                    onChange={e => this.setState({ operatore: e.target.value })}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={1}>
                            <FormGroup>
                                <Label for="dataevento">Data evento</Label>
                                <Input
                                    type="date"
                                    name="dataevento"
                                    id="dataevento"
                                    placeholder="Data evento"
                                    value={this.state.dataevento}
                                    onChange={e => this.setState({ dataevento: e.target.value })}
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
                                    placeholder="Categoria"
                                    value={this.state.categoria}
                                    onChange={e => this.setState({ categoria: e.target.value })}
                                />
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
                                    value={this.state.ditta}
                                    onChange={e => this.setState({ ditta: e.target.value })}
                                />
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
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Button>Add</Button>
                </Form>
            </div>
        )
    }
}