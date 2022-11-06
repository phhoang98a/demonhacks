/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-tabs */
/* eslint-disable react/prop-types */
import React, {useState} from 'react';
import {Button, Col, Row} from 'antd';
import ExchangeModal from './ExchangeModal';
import GetModal from './GetModal';
import UserInfomation from './User';
import NewUserInfomation from './NewUser';

const Contents = ({name, setCamera, setName}) =>{
  const [openExchange, setOpenExchange] = useState(false);
  const [openCandy, setOpenCandy] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openNewUser, setOpenNewUser] = useState(false);

  return (
    <>
      { name =='' ?
        <div style={{marginTop: '30%'}}>
          <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '25px'}}>
                Hi, My name is Trudy - a virtual exchanger. Take a picture so I can identify you and assist you then.
          </p>
        </div>:
        <>
          <div style={{marginTop: '30%'}}>
            <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '25px'}}>
                Hi {name}, my name is Trudy - a virtual exchanger. How can I help you?.
            </p>
            <div>
              <Row style={{marginTop: '50px'}}>
                {
                name == 'Customer' ?
                <>
                  <Col span={6}>
                    <Button disabled size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenExchange(true)}>Exchange candies</Button>
                  </Col>
                  <Col span={6}>
                    <Button disabled size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenCandy(true)}>Get candies</Button>
                  </Col>
                  <Col span={6}>
                    <Button disabled size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenUser(true)}>Show my profile</Button>
                  </Col>
                  <Col span={6}>
                    <Button size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenNewUser(true)}>Add my profile</Button>
                  </Col>
                </>:
                <>
                  <Col span={6}>
                    <Button size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenExchange(true)}>Exchange candies</Button>
                  </Col>
                  <Col span={6}>
                    <Button size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenCandy(true)}>Get candies</Button>
                  </Col>
                  <Col span={6}>
                    <Button size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary" onClick={()=>setOpenUser(true)}>Show my profile</Button>
                  </Col>
                  <Col span={6}>
                    <Button disabled size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}} type="primary">Add my profile</Button>
                  </Col>
                </>
                }
              </Row>
            </div>
            <div>
              <Button size='large' style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: '200px'}} type="primary" onClick={()=>setName('')}>Reset</Button>
            </div>
            <ExchangeModal open={openExchange} setOpen={setOpenExchange} name={name}/>
            <GetModal open={openCandy} setOpen={setOpenCandy} name={name}/>
            <UserInfomation open={openUser} setOpen={setOpenUser} name={name}/>
            <NewUserInfomation open={openNewUser} setOpen={setOpenNewUser} setCamera={setCamera} />
          </div>
        </>
      }
    </>
  );
};

export default Contents;
