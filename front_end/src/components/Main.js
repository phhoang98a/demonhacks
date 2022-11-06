/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, {useState} from 'react';
import Webcam from 'react-webcam';
import {Tooltip, Layout, Col, Row, message, Button} from 'antd';
import {CameraOutlined} from '@ant-design/icons';
import 'antd/dist/antd.less';
import gif from '../images/receptionist.gif';
import Contents from './Contents';

const {Content} = Layout;

const Main = () =>{
  const videoConstraints = {
    facingMode: 'user',
  };

  const [name, setName] = useState('');
  const [camera, setCamera] = useState(true);

  const capture = async (image) =>{
    const data = await fetch('https://candy-api-2022.herokuapp.com/authentication', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        image: image,
      }),
    });
    const response = await data.json();
    if (response.status===200) {
      setName(response.name);
      if (response.name !='Customer') {
        const newDate = new Date().toLocaleString();
        const mes = response.name + ' arrived at ' + newDate + '. Have a good day!';
        message.success({
          content: mes,
          className: 'custom-class',
          style: {
            marginTop: '20vh',
          },
          duration: 3,
        });
      } else {
        message.success({
          content: 'You are a guest. How can I help you?',
          className: 'custom-class',
          style: {
            marginTop: '20vh',
          },
          duration: 3,
        });
      }
    } else {
      message.warning(response.msg);
    }
  };

  const sendMail = () =>{
    const data = fetch('https://candy-api-2022.herokuapp.com/email', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    });
  };

  return (
    <Content style={{backgroundColor: 'rgb(240, 240, 240)', height: '100vh'}}>
      <Row>
        <Col span={6}>
          <img
            style={{width: '100%', marginTop: '70%'}}
            src={gif}
          />
          <Button size='small' onClick={sendMail} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" danger >Send email</Button>
        </Col>
        <Col span={12}>
          <Contents name={name} setCamera={setCamera} setName={setName}/>
        </Col>
        <Col span={6}>
          {camera && <div style={{position: 'relative', height: '250px', marginTop: '50px'}}>
            <Webcam
              audio={false}
              height="100%"
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={videoConstraints}
            >
              {({getScreenshot}) => (
                <Tooltip title='Capture'>
                  <CameraOutlined
                    style={{position: 'absolute', bottom: '10px', right: '45%', zIndex: 10000, fontSize: '50px', color: 'white'}}
                    onClick={async () => {
                      const dataUri = getScreenshot();
                      capture(dataUri);
                    }}/>
                </Tooltip>
              )}
            </Webcam>
          </div>}
        </Col>
      </Row>
    </Content>
  );
};

export default Main;
