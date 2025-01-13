import React from "react";
import {Form, InputGroup, Button} from "react-bootstrap";
import {Utils} from "../utils";

export default function IfaceSelector({onIfaceChange, appendNewScan, gIfaces}) {
  const [ifaces, setIfaces] = React.useState({});
  const [currentSelected, setCurrentSelected] = React.useState();

  // For callback to update state, because in callback we can only get the copy, so we need a ref to point to the latest
  // copy of state of variant objects.
  const ref = React.useRef({});
  React.useEffect(() => {
    ref.current.ifaces = ifaces;
  }, [ifaces]);

  const onClick = React.useCallback((item, checked) => {
    const modules = Utils.copy(ref.current.ifaces, [item, checked]);
    setIfaces(modules);
    setCurrentSelected(checked ? item : null);
    onIfaceChange && onIfaceChange(modules);
  }, [ref, setIfaces, onIfaceChange, setCurrentSelected]);

  const onAppendNewScan = React.useCallback(() => {
    appendNewScan && appendNewScan();
  }, [appendNewScan]);

  return <Form.Group className="mb-3">
    <Form.Label><b>Network card selection</b></Form.Label>
    <Form.Text>
      * Please select the network card to be scanned (Only one can be chosen，if needed scan multiple Interfaces) -> 
    </Form.Text>
    <Button variant="link" size='sm' onClick={(e) => onAppendNewScan()}>Click Here</Button>
    <InputGroup>
      {gIfaces?.map(iface => {
        if (iface?.name?.indexOf('ifb') >= 0) return <React.Fragment key={iface?.name}/>;
        return (
          <Form.Group key={iface?.name} className="mb-3" controlId={`formWxEnabledCheckbox-${iface.name}`}>
            <Form.Check
              type="switch"
              label={iface?.ipv4 ? `${iface?.name}(${iface?.ipv4})` : iface?.name}
              inline defaultChecked={ifaces[iface?.name]}
              onChange={(e) => onClick(iface?.name, e.target.checked)}
              disabled={currentSelected && currentSelected !== iface?.name}
              title={`ipv4: ${iface?.ipv4}, ipv6: ${iface?.ipv6}`}
            />
          </Form.Group>
        );
      })}
    </InputGroup>
  </Form.Group>;
}
