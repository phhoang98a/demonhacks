/* eslint-disable guard-for-in */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import {Modal, Tag, Avatar, Row, Col} from 'antd';
import React, {useEffect, useState} from 'react';
const UserInfomation = ({open, setOpen, name})=>{
  const [userInfo, setUserInfo] = useState({});

  const getUserInformation = async ()=>{
    const data = await fetch('https://candy-api-2022.herokuapp.com/user', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        name: name,
      }),
    });
    const response = await data.json();
    const user = response.information[0];
    setUserInfo(user);
  };

  useEffect(()=>{
    if (open===true) {
      getUserInformation();
    }
  }, [open]);

  return (
    <Modal open={open} width="700px" onCancel={()=>{
      setOpen(false);
    }}
    footer={[]}>
      <Row>
        <Col span={6}>
          <Avatar
            style={{marginTop: '20px'}}
            size={150}
            src={userInfo.image} />
          <p style = {{textAlign: 'center', marginTop: '10px', fontWeight: 'bold', fontSize: '20px'}}>{userInfo.username}</p>
        </Col>
        <Col span={18}>
          <p style = {{marginLeft: '30px', marginTop: '40px', fontSize: '18px'}}><b>Email:</b> {userInfo.email}</p>
          <p style = {{marginLeft: '30px', fontSize: '18px'}}><b>Point:</b> {userInfo.point}</p>
          <div style={{marginLeft: '30px', fontSize: '18px'}}><b>Hobby:</b>
            {userInfo?.hobby?.map((hobby, index) => (
              <Tag key={index} style={{marginLeft: '5px'}}>{hobby}</Tag>
            ))}
          </div>
        </Col>
      </Row>

    </Modal>
  );
};

export default UserInfomation;
