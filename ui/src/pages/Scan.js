import React from "react";
import {Accordion, Form, Row, Col, Button, Spinner, Table} from "react-bootstrap";
import IfaceSelector from "../components/IfaceSelector";
import axios from "axios";
import {useErrorHandler} from "react-error-boundary";

export default function Scan({appendNewScan, executing, setExecuting, gIfaces}) {
  const handleError = useErrorHandler();
  const [selfExecuting, setSelfExecuting] = React.useState(false);
  const [ifaces, setIfaces] = React.useState({});
  const [db, setDb] = React.useState({});

  // Start to scan network interface.
  const scanNetwork = React.useCallback(() => {
    let activeIfaces = Object.keys(ifaces).filter((iface) => ifaces[iface]);
    if (!activeIfaces?.length) activeIfaces = ['any'];

    setExecuting(true);
    setSelfExecuting(true);
    axios.get(`/tc/api/v1/scan?ifaces=${activeIfaces.join(',')}&timeout=15&exp=ip`).then(res => {
      const db = res?.data?.data;
      if (db?.ifaces) db.ifaces2 = Object.keys(db.ifaces).map(k => db.ifaces[k]);
      setDb(db);
      console.log(`scan ok, ifaces=[${activeIfaces.join(',')}]`, db);
    }).catch(handleError).finally(() => {
      setExecuting(false);
      setSelfExecuting(false);
    });
  }, [ifaces, handleError, setDb, setExecuting, setSelfExecuting]);

  return <Accordion defaultActiveKey="0">
    <Accordion.Item eventKey="0">
      <Accordion.Header>Network Traffic Scanning</Accordion.Header>
      <Accordion.Body>
        <Form>
          <IfaceSelector onIfaceChange={setIfaces} appendNewScan={appendNewScan} gIfaces={gIfaces}/>
          <Row>
            <Col xs='auto'>
              <Button
                variant="primary" type="button" disabled={executing || selfExecuting}
                onClick={(e) => scanNetwork(e)}
              >
                Start Scan
              </Button>
            </Col>
            <Col xs='auto'>
              {selfExecuting &&
                <Spinner animation='border' variant='primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </Spinner>
              }
            </Col>
          </Row>
        </Form>
        <p></p>
        <Row>
          <Col xs='auto'>
            {!db?.ifaces2?.length ? <></> : db.ifaces2.map(e => {
              return <Table striped bordered hover key={e?.iface?.name}>
                <thead>
                <tr>
                  <th>#</th>
                  <th>Interface</th>
                  <th>Protocol</th>
                  <th>Source IP</th>
                  <td>Source Port</th>
                  <th>Destination IP</th>
                  <th>Destination Port</th>
                  <th>Number of Packets</th>
                  <th>Total Bytes</th>
                  <th>Direction</th>
                </tr>
                </thead>
                <tbody>
                {e?.endpoints?.map((ep, index) => {
                  return <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{e?.iface?.name}</td>
                    <td>{ep.family === 17 ? 'UDP' : (ep.family === 6 ? 'TCP' : (ep.family === 1 ? 'ICMP' : 'unknown'))}</td>
                    <td>
                      {e?.iface?.ipv4 === ep.source ? '(This machine)' : ''}&nbsp;
                      {ep.source}
                    </td>
                    <td>
                      {ep.sport}
                    </td>
                    <td>
                      {e?.iface?.ipv4 === ep.dest ? '(This machine)' : ''}&nbsp;
                      {ep.dest}
                    </td>
                    <td>{ep.dport}</td>
                    <td>{ep.packets}</td>
                    <td>{ep.bytes}</td>
                    <td>{ep.source === ep.dest ? '' : (e?.iface?.ipv4 === ep.source ? 'IN' : 'OUT')}</td>
                  </tr>;
                })}
                </tbody>
              </Table>;
            })}
          </Col>
        </Row>
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>;
}
