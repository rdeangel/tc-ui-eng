import React from "react";
import {Col, Form, InputGroup, Row} from "react-bootstrap";

export default function NetFilter({gIfaces,
    iface, setIface, protocol, setProtocol, direction,
    setDirection, identifyKey, setIdentifyKey, identifyValue, setIdentifyValue,
  }) {
  const [ivVisible, setIvVisible] = React.useState(false);
  const [ivLabel, setIvLabel] = React.useState('IP');

  React.useEffect(() => {
    const nv = identifyKey;
    setIvVisible(nv === "serverPort" || nv === "clientPort" || nv === "clientIp");
    setIvLabel(nv === "clientIp" ? 'IP' : 'Port');
  }, [identifyKey, setIvVisible, setIvLabel]);

  const updateIdentify = React.useCallback((e) => {
    const nv = e.target.value;
    setIdentifyKey(nv);
    setIvVisible(nv === "serverPort" || nv === "clientPort" || nv === "clientIp");
    setIvLabel(nv === "clientIp" ? 'IP' : 'Port');
  }, [setIdentifyKey, setIvLabel, setIvVisible]);

  return (
    <Row>
      <Col xs='auto'>
        <Form.Group className="mb-3">
          <Form.Label><b>Network Interface</b></Form.Label>
          <Form.Text> * Applied to specified Network Interface</Form.Text>
          <InputGroup hasValidation>
            <Form.Select required defaultValue={iface} onChange={(e) => setIface(e.target.value)}>
              <option value="">--Please Select--</option>
              {gIfaces?.map(iface => {
                if (iface?.name?.indexOf('ifb') >= 0) return <React.Fragment key={iface.name}/>;
                return <option key={iface.name} value={iface.name}>{iface.name}</option>;
              })}
            </Form.Select>
            <Form.Control.Feedback type='invalid' tooltip>Select Network Interface</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col xs='auto'>
        <Form.Group className="mb-3">
          <Form.Label><b>Network Protocol</b></Form.Label>
          <Form.Text> * Applied to specified Network Interface</Form.Text>
          <InputGroup hasValidation>
            <Form.Select required defaultValue={protocol} onChange={(e) => setProtocol(e.target.value)}>
              <option value="">--Please Select--</option>
              <option value="ip">IP</option>
            </Form.Select>
            <Form.Control.Feedback type='invalid' tooltip>Select a Protocol</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col xs='auto'>
        <Form.Group className="mb-3">
          <Form.Label><b>Flow Direction</b></Form.Label>
          <Form.Text> * Inflow or Outflow</Form.Text>
          <InputGroup hasValidation>
            <Form.Select required defaultValue={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="">--Please Select--</option>
              <option value="incoming">Inflow(incoming), Data sent to this interface</option>
              <option value="outgoing">Outflow(outgoing), Data received by this interface</option>
            </Form.Select>
            <Form.Control.Feedback type='invalid' tooltip>Select Client Type</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col xs='auto'>
        <Form.Group className="mb-3">
          <Form.Label><b>Filter</b></Form.Label>
          <Form.Text> * Define Network Details to be Modified by TC</Form.Text>
          <InputGroup hasValidation>
            <Form.Select required defaultValue={identifyKey} onChange={updateIdentify}>
              <option value="">--Please Select--</option>
              <option value="serverPort">Server Port</option>n>
              <option value="clientIp">Client IP</option>n>
              <option value="clientPort">Client Port</option>
              <option value="all">Match ANY</option>
            </Form.Select>
            <Form.Control.Feedback type='invalid' tooltip>Please Select Traffic to be Modified by TC</Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </Col>
      {ivVisible &&
        <Col xs='auto'>
          <Form.Group className="mb-3">
            <Form.Label><b>According to{ivLabel}</b></Form.Label>
            <Form.Text> * Please Enter{ivLabel}</Form.Text>
            <InputGroup hasValidation>
              <Form.Control
                required type="input" placeholder={`Enter Match${ivLabel}`} defaultValue={identifyValue}
                onChange={(e) => setIdentifyValue(e.target.value)}
              />
              <Form.Control.Feedback type='invalid' tooltip>Please Enter{ivLabel}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      }
    </Row>
  );
}
